const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const env = require('../config/env');

const STAGE_LABELS = {
  RECEIVED: 'Application Received',
  GIST_PREPARED: 'Gist Prepared',
  ROUTED: 'Routed to VRO & Tahsildar',
  IVRS_SENT: 'IVRS / SMS Sent to Applicant',
  IN_PROGRESS: 'Under Process',
  ENDORSED: 'Endorsement Issued',
  CLOSED: 'Closed with Feedback'
};

const dashboardController = {
  async getStats(req, res, next) {
    try {
      const now = new Date();
      const grievances = await Grievance.find({});

      const total = grievances.length;
      let active = 0;
      let resolved = 0;
      let beyondSlaCount = 0;
      let totalRating = 0;
      let feedbackCount = 0;

      const byMandal = {};
      const byCategory = {};
      const byStage = {
        RECEIVED: 0,
        GIST_PREPARED: 0,
        ROUTED: 0,
        IVRS_SENT: 0,
        IN_PROGRESS: 0,
        ENDORSED: 0,
        CLOSED: 0
      };

      const beyondSlaList = [];

      for (const g of grievances) {
        // By mandal
        if (g.mandal) {
          byMandal[g.mandal] = (byMandal[g.mandal] || 0) + 1;
        }

        // By category
        if (g.category) {
          byCategory[g.category] = (byCategory[g.category] || 0) + 1;
        }

        // By stage
        if (byStage[g.stage] !== undefined) {
          byStage[g.stage]++;
        }

        // Feedback calculation
        if (g.feedback && g.feedback.rating) {
          totalRating += g.feedback.rating;
          feedbackCount++;
        }

        // Resolution status
        if (g.stage === 'ENDORSED' || g.stage === 'CLOSED') {
          resolved++;
        } else {
          active++;
          // SLA check
          const deadline = new Date(g.sla_deadline);
          if (deadline < now) {
            beyondSlaCount++;
            beyondSlaList.push(g.toJSON());
          }
        }
      }

      const satisfaction = feedbackCount > 0 ? parseFloat((totalRating / feedbackCount).toFixed(1)) : 5.0;

      // Fetch recent 10 notifications
      const recentMessages = await Notification.find({})
        .sort({ at: -1 })
        .limit(10);

      res.json({
        total,
        active,
        resolved,
        beyond_sla: beyondSlaCount,
        satisfaction,
        feedback_count: feedbackCount,
        sla_days: env.slaDefaultDays,
        by_mandal: byMandal,
        by_category: byCategory,
        by_stage: byStage,
        stage_labels: STAGE_LABELS,
        beyond_sla_list: beyondSlaList,
        recent_messages: recentMessages
      });
    } catch (err) {
      next(err);
    }
  },

  async getEscalations(req, res, next) {
    try {
      const now = new Date();
      const overdueGrievances = await Grievance.find({
        stage: { $nin: ['ENDORSED', 'CLOSED'] },
        sla_deadline: { $lt: now }
      }).sort({ sla_deadline: 1 });

      res.json({
        success: true,
        count: overdueGrievances.length,
        escalations: overdueGrievances
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
