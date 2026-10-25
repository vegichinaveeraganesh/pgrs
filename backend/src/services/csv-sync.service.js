const fs = require('fs');
const Grievance = require('../models/Grievance');
const Mandal = require('../models/Mandal');
const Village = require('../models/Village');
const Official = require('../models/Official');
const AuditLog = require('../models/AuditLog');
const routingService = require('./routing.service');
const gistService = require('./gist.service');

/**
 * Intelligent CSV parsing helper supporting quoted fields, commas and varying delimiters
 */
function parseCsvContent(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = splitCsvLine(headerLine).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const values = splitCsvLine(rawLine);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ? values[idx].trim() : '';
    });
    records.push(row);
  }
  return records;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      result.push(current.replace(/^["']|["']$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^["']|["']$/g, '').trim());
  return result;
}

/**
 * Finds best matching field from a row given candidate keys
 */
function findField(row, candidates) {
  const rowKeys = Object.keys(row);
  for (const c of candidates) {
    const found = rowKeys.find(k => k === c || k.includes(c));
    if (found && row[found]) return row[found];
  }
  return '';
}

const csvSyncService = {
  /**
   * Process uploaded PGRS CSV content and upsert into database
   */
  async processCsv(csvString, uploadedBy = 'RDO Officer') {
    const rows = parseCsvContent(csvString);
    if (rows.length === 0) {
      throw new Error('CSV file is empty or formatted incorrectly. Please upload a valid CSV file exported from PGRS.');
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    const mandalsSet = new Set();

    // Cache officials and villages for fast lookup
    const allOfficials = await Official.find({});
    const allVillages = await Village.find({});
    const allMandals = await Mandal.find({});

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        // Extract PGRS Number
        let pgrsNo = findField(row, ['grievance_no', 'pgrs_no', 'grievance_id', 'petition_no', 'application_no', 'id']);
        if (!pgrsNo) {
          pgrsNo = `PGRS-AP-2026-${10500 + i}`;
        }

        // Extract Applicant Name
        let applicantName = findField(row, ['applicant_name', 'citizen_name', 'petitioner_name', 'applicant', 'name']);
        if (!applicantName) applicantName = `Citizen ${i + 1}`;

        // Extract Phone
        let phone = findField(row, ['mobile_no', 'phone', 'mobile', 'contact_no', 'cell']);
        if (!phone) phone = '+91 94901 00000';

        // Extract Address, Mandal & Village
        let grievanceAddress = findField(row, ['grievance_address', 'address', 'location']);
        let mandalName = findField(row, ['mandal', 'mandal_name', 'taluk']);
        let villageName = findField(row, ['village', 'village_name', 'ward', 'habitation']);

        if (grievanceAddress && (!mandalName || !villageName)) {
          const parts = grievanceAddress.split(',').map(p => p.trim());
          if (parts.length >= 2 && !mandalName) {
            mandalName = parts[1];
          }
          if (parts.length >= 3 && !villageName) {
            villageName = parts[2].replace(/-\([RU]\)/i, '').trim();
          }
        }

        if (!mandalName) {
          mandalName = 'Bheemunipatnam';
        } else {
          const lower = mandalName.toLowerCase();
          if (lower.includes('bhim') || lower.includes('bheem')) mandalName = 'Bheemunipatnam';
          else if (lower.includes('anand')) mandalName = 'Anandapuram';
          else if (lower.includes('padman')) mandalName = 'Padmanabham';
          else if (lower.includes('rural')) mandalName = 'Visakhapatnam Rural';
          else if (lower.includes('seetham') || lower.includes('sitham')) mandalName = 'Seethammadhara';
        }
        mandalsSet.add(mandalName);

        if (!villageName) villageName = mandalName;

        // Extract Source Channel
        let sourceChannel = findField(row, ['source', 'channel', 'scheme', 'petition_type', 'type']);
        if (!sourceChannel) sourceChannel = 'PGRS (Monday/Other Days)';

        // Extract Category / Department
        let category = findField(row, ['department', 'category', 'service_name', 'grievance_type']);
        if (!category) category = 'Revenue & Land Matters';

        // Extract Subject / Sub-Subject / Description
        let subject = findField(row, ['subject', 'title']);
        let subSubject = findField(row, ['sub_subject', 'subsubject', 'sub_category']);
        if (!subject && subSubject) subject = subSubject;
        if (!subject) subject = `${category} Petition`;

        let description = findField(row, ['description', 'details', 'grievance_description', 'remarks']);
        if (!description && subSubject) description = `${subject}: ${subSubject}`;
        if (!description) description = `Grievance submitted by ${applicantName} in ${villageName}, ${mandalName}. Early enquiry and redressal requested.`;

        // Extract SLA days from CSV (e.g. "60", "75", "105")
        let slaDays = parseInt(findField(row, ['sla']), 10) || 15;

        // Extract Status
        let statusStr = (findField(row, ['status', 'stage', 'current_status', 'redressal_status']) || '').toUpperCase();
        let stage = 'IN_PROGRESS';
        let stageLabel = 'Under Process';

        if (statusStr.includes('CLOSE') || statusStr.includes('REDRESS') || statusStr.includes('RESOLV')) {
          stage = 'CLOSED';
          stageLabel = 'Closed with Feedback';
        } else if (statusStr.includes('ENDORSE')) {
          stage = 'ENDORSED';
          stageLabel = 'Endorsement Issued';
        } else if (statusStr.includes('ROUT')) {
          stage = 'ROUTED';
          stageLabel = 'Routed to VRO & Tahsildar';
        } else if (statusStr.includes('RECEIV') || statusStr.includes('NEW')) {
          stage = 'RECEIVED';
          stageLabel = 'Application Received';
        }

        // Dates and SLA
        const now = new Date();
        let createdAt = now;
        const regDateStr = findField(row, ['date', 'registered_date', 'application_date', 'received_date', 'created_at']);
        if (regDateStr) {
          const parsed = new Date(regDateStr);
          if (!isNaN(parsed.getTime())) createdAt = parsed;
        }

        const slaDeadline = new Date(createdAt.getTime() + slaDays * 24 * 60 * 60 * 1000);

        // Map VRO and Tahsildar
        const matchedMandal = allMandals.find(m => m.name.toLowerCase() === mandalName.toLowerCase());
        const matchedVillage = allVillages.find(v => v.name.toLowerCase() === villageName.toLowerCase() && v.mandal.toLowerCase() === mandalName.toLowerCase());
        const vroOfficial = allOfficials.find(o => o.role === 'VRO' && o.mandal === mandalName);
        const tahsildarOfficial = allOfficials.find(o => o.role === 'Tahsildar' && o.mandal === mandalName);

        const vro = {
          name: matchedVillage?.vroName || vroOfficial?.name || 'Concerned VRO',
          phone: matchedVillage?.vroPhone || vroOfficial?.phone || '+91 94901 23000'
        };

        const tahsildar = {
          name: matchedMandal?.tahsildarName || tahsildarOfficial?.name || 'Tahsildar ' + mandalName,
          phone: matchedMandal?.tahsildarPhone || tahsildarOfficial?.phone || '+91 94901 23000'
        };

        const existingGrievance = await Grievance.findOne({ pgrs_no: pgrsNo });
        const gist = gistService.generateDeterministicGist({
          applicant_name: applicantName,
          category,
          subject,
          village: villageName,
          mandal: mandalName,
          description
        });

        if (existingGrievance) {
          existingGrievance.applicant_name = applicantName;
          existingGrievance.phone = phone;
          existingGrievance.mandal = mandalName;
          existingGrievance.village = villageName;
          existingGrievance.category = category;
          existingGrievance.subject = subject;
          existingGrievance.description = description;
          existingGrievance.gist = gist;
          existingGrievance.stage = stage;
          existingGrievance.stage_label = stageLabel;
          existingGrievance.vro = vro;
          existingGrievance.tahsildar = tahsildar;
          if (stage === 'CLOSED' && !existingGrievance.closed_at) {
            existingGrievance.closed_at = new Date();
          }
          await existingGrievance.save();
          updated++;
        } else {
          const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (`app-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);

          const newGrievance = new Grievance({
            id: newId,
            pgrs_no: pgrsNo,
            applicant_name: applicantName,
            phone,
            mandal: mandalName,
            mandalId: matchedMandal?._id || undefined,
            village: villageName,
            villageId: matchedVillage?._id || undefined,
            category,
            subject,
            description,
            gist,
            stage,
            stage_label: stageLabel,
            vro,
            tahsildar,
            sla_days: slaDays,
            sla_deadline: slaDeadline,
            created_at: createdAt,
            closed_at: stage === 'CLOSED' ? new Date() : undefined,
            timeline: [
              {
                stage: 'RECEIVED',
                label: 'Application Received',
                note: `Grievance synced from uploaded PGRS CSV into RDO Bhimunipatnam database (${sourceChannel}).`,
                at: createdAt
              },
              {
                stage: 'GIST_PREPARED',
                label: 'Gist Prepared',
                note: 'Automated gist of the uploaded petition prepared by the system.',
                at: new Date(createdAt.getTime() + 10 * 60 * 1000)
              },
              {
                stage: 'ROUTED',
                label: 'Routed to VRO & Tahsildar',
                note: `Routed to ${vro.name} (VRO) and ${tahsildar.name} (Tahsildar).`,
                at: new Date(createdAt.getTime() + 30 * 60 * 1000)
              }
            ]
          });

          await newGrievance.save();
          inserted++;
        }
      } catch (rowErr) {
        // Log the error but continue processing other rows
        console.warn(`[CSV Sync] Row ${i + 1} error: ${rowErr.message}`);
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
        skipped++;
      }
    }

    // Recalculate official workload counts
    try {
      await routingService.recalculateOfficialCounts();
    } catch (e) {
      console.warn('[CSV Sync] Could not recalculate official counts:', e.message);
    }

    // Log audit
    try {
      const audit = new AuditLog({
        action: 'PGRS_CSV_SYNC',
        entity_type: 'PGRS_IMPORT',
        details: {
          totalRows: rows.length,
          inserted,
          updated,
          skipped,
          uploadedBy,
          mandals: Array.from(mandalsSet)
        }
      });
      await audit.save();
    } catch (e) {
      console.warn('[CSV Sync] Audit log save failed:', e.message);
    }

    return {
      success: true,
      totalRows: rows.length,
      inserted,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      mandals: Array.from(mandalsSet),
      totalGrievances: await Grievance.countDocuments(),
      message: `Successfully synchronized ${rows.length} PGRS records (${inserted} added, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ''}).`
    };
  }
};

module.exports = csvSyncService;
