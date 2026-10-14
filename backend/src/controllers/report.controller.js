const Grievance = require('../models/Grievance');
const Mandal = require('../models/Mandal');
const Official = require('../models/Official');

const reportController = {
  async getSummary(req, res, next) {
    try {
      const grievances = await Grievance.find({});

      // Aggregations
      const mandalStats = {};
      const categoryStats = {};
      const stageStats = {};
      let totalOverdue = 0;
      let totalFeedback = 0;
      let sumRating = 0;

      const now = new Date();

      grievances.forEach(g => {
        // Mandal
        if (!mandalStats[g.mandal]) {
          mandalStats[g.mandal] = { total: 0, pending: 0, resolved: 0, beyondSla: 0 };
        }
        mandalStats[g.mandal].total++;

        const isResolved = g.stage === 'ENDORSED' || g.stage === 'CLOSED';
        if (isResolved) {
          mandalStats[g.mandal].resolved++;
        } else {
          mandalStats[g.mandal].pending++;
          if (new Date(g.sla_deadline) < now) {
            mandalStats[g.mandal].beyondSla++;
            totalOverdue++;
          }
        }

        // Category
        categoryStats[g.category] = (categoryStats[g.category] || 0) + 1;

        // Stage
        stageStats[g.stage] = (stageStats[g.stage] || 0) + 1;

        // Feedback
        if (g.feedback && g.feedback.rating) {
          totalFeedback++;
          sumRating += g.feedback.rating;
        }
      });

      res.json({
        total: grievances.length,
        totalOverdue,
        averageSatisfaction: totalFeedback > 0 ? (sumRating / totalFeedback).toFixed(1) : '5.0',
        feedbackCount: totalFeedback,
        mandalStats,
        categoryStats,
        stageStats
      });
    } catch (err) {
      next(err);
    }
  },

  async exportReport(req, res, next) {
    try {
      const { format, mandal } = req.query;
      let query = {};
      if (mandal) query.mandal = mandal;

      const grievances = await Grievance.find(query).sort({ created_at: -1 });

      if (format === 'csv') {
        const headers = [
          'PGRS No',
          'Applicant Name',
          'Phone',
          'Mandal',
          'Village',
          'Category',
          'Subject',
          'Stage',
          'VRO',
          'Tahsildar',
          'Created Date',
          'SLA Deadline',
          'SLA Status',
          'Endorsement Remarks',
          'Rating'
        ];

        const rows = grievances.map(g => [
          `"${g.pgrs_no || ''}"`,
          `"${(g.applicant_name || '').replace(/"/g, '""')}"`,
          `"${g.phone || ''}"`,
          `"${g.mandal || ''}"`,
          `"${g.village || ''}"`,
          `"${g.category || ''}"`,
          `"${(g.subject || '').replace(/"/g, '""')}"`,
          `"${g.stage || ''}"`,
          `"${g.vro?.name || ''}"`,
          `"${g.tahsildar?.name || ''}"`,
          `"${g.created_at ? new Date(g.created_at).toISOString().split('T')[0] : ''}"`,
          `"${g.sla_deadline ? new Date(g.sla_deadline).toISOString().split('T')[0] : ''}"`,
          `"${g.sla?.status || ''}"`,
          `"${(g.endorsement?.remarks || '').replace(/"/g, '""')}"`,
          `"${g.feedback?.rating || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rdo_bhimili_pgrs_report.csv"');
        return res.send(csvContent);
      }

      res.json({ count: grievances.length, data: grievances });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
