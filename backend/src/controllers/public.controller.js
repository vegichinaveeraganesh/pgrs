const Grievance = require('../models/Grievance');

const publicController = {
  async trackGrievance(req, res, next) {
    try {
      const { id } = req.params;
      const cleanId = (id || '').trim();

      const grievance = await Grievance.findOne({
        $or: [
          { pgrs_no: cleanId },
          { id: cleanId }
        ]
      });

      if (!grievance) {
        return res.status(404).json({
          success: false,
          message: 'No grievance application found matching the reference ID'
        });
      }

      // Privacy-safe masking for applicant phone
      const rawPhone = grievance.phone || '';
      const maskedPhone = rawPhone.length > 5
        ? rawPhone.substring(0, 3) + '*****' + rawPhone.slice(-3)
        : '******';

      // Safe public payload - no private attachments, internal comments, or full contact numbers
      const publicData = {
        pgrs_no: grievance.pgrs_no,
        applicant_name: grievance.applicant_name,
        masked_phone: maskedPhone,
        mandal: grievance.mandal,
        village: grievance.village,
        category: grievance.category,
        subject: grievance.subject,
        gist: grievance.gist,
        stage: grievance.stage,
        stage_label: grievance.stage_label,
        received_at: grievance.created_at,
        sla_deadline: grievance.sla_deadline,
        sla: grievance.sla,
        assigned_officials: {
          tahsildar: grievance.tahsildar?.name || 'Tahsildar ' + grievance.mandal,
          vro: grievance.vro?.name || 'Village Revenue Officer'
        },
        timeline: (grievance.timeline || []).map(t => ({
          stage: t.stage,
          label: t.label,
          note: t.note,
          at: t.at
        })),
        is_endorsed: Boolean(grievance.endorsement),
        endorsement_summary: grievance.endorsement ? {
          remarks: grievance.endorsement.remarks,
          officer_name: grievance.endorsement.officer_name,
          at: grievance.endorsement.at,
          has_document: Boolean(grievance.endorsement.document_url)
        } : null,
        is_closed: grievance.stage === 'CLOSED',
        closed_at: grievance.closed_at
      };

      res.json({
        success: true,
        data: publicData
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = publicController;
