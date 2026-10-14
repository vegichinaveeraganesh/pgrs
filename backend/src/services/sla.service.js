const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

class SlaService {
  /**
   * Calculate SLA status for a grievance object
   */
  computeSlaStatus(grievance) {
    if (grievance.stage === 'ENDORSED' || grievance.stage === 'CLOSED') {
      return {
        status: 'resolved',
        days_remaining: null,
        label: 'Resolved'
      };
    }

    const now = new Date();
    const deadline = new Date(grievance.sla_deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdue = Math.abs(diffDays);
      return {
        status: 'beyond_sla',
        days_remaining: diffDays,
        label: `${overdue} day${overdue === 1 ? '' : 's'} overdue`
      };
    } else if (diffDays <= 3) {
      return {
        status: 'near_breach',
        days_remaining: diffDays,
        label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`
      };
    } else {
      return {
        status: 'on_track',
        days_remaining: diffDays,
        label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`
      };
    }
  }

  /**
   * Scan all active grievances and escalate beyond-SLA cases
   */
  async runSlaCheck() {
    const activeGrievances = await Grievance.find({
      stage: { $nin: ['ENDORSED', 'CLOSED'] }
    });

    const escalated = [];

    for (const app of activeGrievances) {
      const sla = this.computeSlaStatus(app);
      if (sla.status === 'beyond_sla' && !app.sla_alert_sent) {
        // Send escalation alert to VRO, Tahsildar, and RDO
        const overdueDays = Math.abs(sla.days_remaining);
        const alertText = `BEYOND SLA ALERT: Grievance ${app.pgrs_no} (${app.subject}) of ${app.applicant_name}, ${app.village} village, ${app.mandal} mandal is overdue by ${overdueDays} days. Upload the endorsement immediately. - RDO Bhimunipatnam`;

        // 1. Alert to VRO
        if (app.vro && app.vro.name) {
          await this._createAlertRecord({
            toName: app.vro.name,
            toPhone: app.vro.phone || '+91 94901 00000',
            role: 'VRO',
            text: alertText,
            app
          });
        }

        // 2. Alert to Tahsildar
        if (app.tahsildar && app.tahsildar.name) {
          await this._createAlertRecord({
            toName: app.tahsildar.name,
            toPhone: app.tahsildar.phone || '+91 94901 23000',
            role: 'Tahsildar',
            text: alertText,
            app
          });
        }

        // 3. Alert to RDO Bhimunipatnam
        await this._createAlertRecord({
          toName: 'RDO Bhimunipatnam',
          toPhone: '+91 94901 23000',
          role: 'RDO',
          text: alertText,
          app
        });

        app.sla_alert_sent = true;
        await app.save();
        escalated.push(app.pgrs_no);
      }
    }

    return {
      scannedCount: activeGrievances.length,
      escalatedCount: escalated.length,
      escalated
    };
  }

  async _createAlertRecord({ toName, toPhone, role, text, app }) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
    const notification = new Notification({
      id,
      channel: 'ALERT',
      to_name: toName,
      to_phone: toPhone,
      role,
      text,
      app_id: app.id,
      pgrs_no: app.pgrs_no,
      status: 'simulated_sent',
      at: new Date()
    });
    await notification.save();
  }
}

module.exports = new SlaService();
