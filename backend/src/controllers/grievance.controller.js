const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const gistService = require('../services/gist.service');
const routingService = require('../services/routing.service');
const ivrsService = require('../services/ivrs.service');
const smsService = require('../services/sms.service');
const slaService = require('../services/sla.service');
const env = require('../config/env');

const STAGES = [
  'RECEIVED',
  'GIST_PREPARED',
  'ROUTED',
  'IVRS_SENT',
  'IN_PROGRESS',
  'ENDORSED',
  'CLOSED'
];

const STAGE_LABELS = {
  RECEIVED: 'Application Received',
  GIST_PREPARED: 'Gist Prepared',
  ROUTED: 'Routed to VRO & Tahsildar',
  IVRS_SENT: 'IVRS / SMS Sent to Applicant',
  IN_PROGRESS: 'Under Process',
  ENDORSED: 'Endorsement Issued',
  CLOSED: 'Closed with Feedback'
};

const grievanceController = {
  async getGrievances(req, res, next) {
    try {
      const { mandal, stage, sla, q, category } = req.query;

      let query = {};

      if (mandal) {
        query.mandal = mandal;
      }

      if (stage) {
        query.stage = stage;
      }

      if (category) {
        query.category = category;
      }

      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        query.$or = [
          { pgrs_no: regex },
          { applicant_name: regex },
          { phone: regex },
          { subject: regex },
          { village: regex }
        ];
      }

      let grievances = await Grievance.find(query).sort({ created_at: -1 });

      // In-memory filter for computed SLA if provided
      if (sla) {
        grievances = grievances.filter(g => {
          const slaStatus = g.sla.status;
          return slaStatus === sla;
        });
      }

      res.json({
        total: grievances.length,
        applications: grievances,
        stages: STAGES,
        stage_labels: STAGE_LABELS
      });
    } catch (err) {
      next(err);
    }
  },

  async getGrievanceById(req, res, next) {
    try {
      const { id } = req.params;
      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({
          success: false,
          detail: 'Grievance application not found'
        });
      }

      res.json(grievance);
    } catch (err) {
      next(err);
    }
  },

  async createGrievance(req, res, next) {
    try {
      const {
        applicant_name,
        phone,
        email,
        mandal,
        village,
        category,
        subject,
        description,
        sla_days
      } = req.body;

      if (!applicant_name || !phone || !mandal || !village || !category || !subject || !description) {
        return res.status(400).json({
          success: false,
          detail: 'Missing required fields: applicant_name, phone, mandal, village, category, subject, description'
        });
      }

      // Generate IDs
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
      const count = await Grievance.countDocuments();
      const pgrsNo = `PGRS-AP-2026-${10420 + count}`;

      // Routing
      const routing = await routingService.resolveOfficers(mandal, village);

      // SLA
      const days = parseInt(sla_days, 10) || env.slaDefaultDays;
      const now = new Date();
      const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      // Gist
      const gistResult = await gistService.generateGist({
        category,
        mandal,
        village,
        subject,
        description,
        applicant_name
      });

      const initialTimeline = [
        {
          stage: 'RECEIVED',
          label: 'Application Received',
          note: 'Grievance received into RDO Bhimunipatnam database.',
          at: now
        },
        {
          stage: 'GIST_PREPARED',
          label: 'Gist Prepared',
          note: 'Automated gist of the application prepared by the system.',
          at: new Date(now.getTime() + 1000)
        },
        {
          stage: 'ROUTED',
          label: 'Routed to VRO & Tahsildar',
          note: routing.isFullyRouted
            ? `Assigned to VRO (${routing.vro.name}) and Tahsildar (${routing.tahsildar.name}).`
            : 'Application in routing queue. Manual mapping review needed.',
          at: new Date(now.getTime() + 2000)
        }
      ];

      const newGrievance = new Grievance({
        id: uniqueId,
        pgrs_no: pgrsNo,
        applicant_name,
        phone,
        email,
        mandal,
        village,
        category,
        subject,
        description,
        gist: gistResult.gist,
        stage: routing.isFullyRouted ? 'ROUTED' : 'GIST_PREPARED',
        stage_label: routing.isFullyRouted ? 'Routed to VRO & Tahsildar' : 'Gist Prepared',
        vro: routing.vro,
        tahsildar: routing.tahsildar,
        sla_days: days,
        sla_deadline: deadline,
        timeline: initialTimeline,
        created_at: now
      });

      await newGrievance.save();

      // Dispatch automated SMS
      await smsService.sendSMS({
        toName: applicant_name,
        toPhone: phone,
        role: 'Applicant',
        text: `Namaste ${applicant_name}. Your grievance ${pgrsNo} (${subject}) has been registered at RDO Bhimunipatnam. VRO assigned: ${routing.vro?.name || 'Pending'}. Resolution deadline: ${days} days.`,
        grievanceId: newGrievance.id,
        pgrsNo
      });

      await routingService.recalculateOfficialCounts();

      res.status(201).json(newGrievance);
    } catch (err) {
      next(err);
    }
  },

  async updateGrievance(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({
          success: false,
          detail: 'Grievance not found'
        });
      }

      Object.assign(grievance, updates);
      await grievance.save();

      res.json(grievance);
    } catch (err) {
      next(err);
    }
  },

  async generateOrEditGist(req, res, next) {
    try {
      const { id } = req.params;
      const { customGist } = req.body;

      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      if (customGist) {
        grievance.gist = customGist.trim();
      } else {
        const result = await gistService.generateGist(grievance);
        grievance.gist = result.gist;
      }

      await grievance.save();
      res.json({ success: true, gist: grievance.gist, grievance });
    } catch (err) {
      next(err);
    }
  },

  async assignOfficials(req, res, next) {
    try {
      const { id } = req.params;
      const { vro, tahsildar, reason } = req.body;

      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      if (vro) grievance.vro = vro;
      if (tahsildar) grievance.tahsildar = tahsildar;

      grievance.timeline.push({
        stage: 'ROUTED',
        label: 'Officer Reassigned',
        note: reason || `Officials updated: VRO (${grievance.vro?.name}), Tahsildar (${grievance.tahsildar?.name})`,
        at: new Date()
      });

      await grievance.save();
      await routingService.recalculateOfficialCounts();

      res.json({ success: true, grievance });
    } catch (err) {
      next(err);
    }
  },

  async uploadEndorsement(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks, officer_name } = req.body;

      if (!remarks || !officer_name) {
        return res.status(400).json({
          success: false,
          detail: 'Endorsement remarks and officer name are required'
        });
      }

      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      const now = new Date();
      let docUrl = null;
      let origName = null;

      if (req.file) {
        docUrl = `/uploads/${req.file.filename}`;
        origName = req.file.originalname;
      }

      grievance.endorsement = {
        remarks: remarks.trim(),
        officer_name: officer_name.trim(),
        document_url: docUrl,
        original_filename: origName,
        at: now
      };

      grievance.stage = 'ENDORSED';
      grievance.stage_label = 'Endorsement Issued';

      grievance.timeline.push({
        stage: 'ENDORSED',
        label: 'Endorsement Issued',
        note: `Endorsement uploaded by ${officer_name.trim()} and compliance message dispatched to applicant from RDO Bhimunipatnam.`,
        at: now,
        officerName: officer_name.trim()
      });

      await grievance.save();

      // Dispatch compliance notification to applicant
      await smsService.sendSMS({
        toName: grievance.applicant_name,
        toPhone: grievance.phone,
        role: 'Applicant',
        text: `Your grievance ${grievance.pgrs_no} has been disposed with endorsement by ${officer_name}. Remarks: "${remarks.trim()}". - Revenue Divisional Office, Bhimunipatnam`,
        grievanceId: grievance.id,
        pgrsNo: grievance.pgrs_no
      });

      await routingService.recalculateOfficialCounts();

      res.json({
        success: true,
        message: 'Endorsement uploaded successfully',
        grievance
      });
    } catch (err) {
      next(err);
    }
  },

  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          detail: 'Rating must be an integer between 1 and 5'
        });
      }

      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      const now = new Date();
      grievance.feedback = {
        rating: numRating,
        comment: (comment || '').trim(),
        at: now
      };

      grievance.stage = 'CLOSED';
      grievance.stage_label = 'Closed with Feedback';
      grievance.closed_at = now;

      grievance.timeline.push({
        stage: 'CLOSED',
        label: 'Closed with Feedback',
        note: `Citizen feedback recorded through IVRS (${numRating} stars: "${comment || 'No comment'}"). Forwarded to Tahsildar and VRO.`,
        at: now
      });

      await grievance.save();

      // Forward feedback to Tahsildar & VRO
      if (grievance.tahsildar?.phone) {
        await smsService.sendSMS({
          toName: grievance.tahsildar.name || 'Tahsildar',
          toPhone: grievance.tahsildar.phone,
          role: 'Tahsildar',
          text: `Citizen feedback received for ${grievance.pgrs_no}: Rating ${numRating}/5 - "${comment || 'Satisfied'}". - RDO Bhimunipatnam`,
          grievanceId: grievance.id,
          pgrsNo: grievance.pgrs_no
        });
      }

      await routingService.recalculateOfficialCounts();

      res.json({
        success: true,
        message: 'Citizen feedback recorded successfully',
        grievance
      });
    } catch (err) {
      next(err);
    }
  },

  async triggerIvrs(req, res, next) {
    try {
      const { id } = req.params;
      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      const result = await ivrsService.placeCall(grievance);

      // If at stage ROUTED, progress to IVRS_SENT
      if (grievance.stage === 'ROUTED') {
        grievance.stage = 'IVRS_SENT';
        grievance.stage_label = 'IVRS / SMS Sent to Applicant';
        grievance.timeline.push({
          stage: 'IVRS_SENT',
          label: 'IVRS / SMS Sent to Applicant',
          note: 'Automated IVRS call and SMS sent to the applicant with the VRO contact details.',
          at: new Date()
        });
        await grievance.save();
      }

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const grievance = await Grievance.findOne({
        $or: [{ id: id }, { pgrs_no: id }]
      });

      if (!grievance) {
        return res.status(404).json({ success: false, detail: 'Grievance not found' });
      }

      res.json({
        id: grievance.id,
        pgrs_no: grievance.pgrs_no,
        timeline: grievance.timeline,
        stage: grievance.stage,
        stage_label: grievance.stage_label
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = grievanceController;
