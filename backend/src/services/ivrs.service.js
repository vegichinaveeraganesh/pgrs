const Notification = require('../models/Notification');
const env = require('../config/env');

const ivrsService = {
  /**
   * Generate automated IVRS script for an application
   */
  generateScript(application) {
    const vroName = application.vro?.name || 'Concerned VRO';
    const vroPhone = application.vro?.phone || 'Mandal Revenue Office';
    const tahsildarPhone = application.tahsildar?.phone || 'RDO Office';
    const mandal = application.mandal || 'Bhimunipatnam';

    return `Namaste. This is an automated call from the Revenue Divisional Office, Bhimunipatnam. Your grievance ${application.pgrs_no} regarding ${application.subject} is under process. Your Village Revenue Officer is ${vroName} and can be contacted at ${vroPhone}. For escalation contact Tahsildar ${mandal} at ${tahsildarPhone}.`;
  },

  /**
   * Dispatch an IVRS voice call (Simulated or Live Provider)
   */
  async placeCall(application) {
    const isSimulation = env.ivrsMode === 'simulation';
    const script = this.generateScript(application);
    const notificationId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));

    const notification = new Notification({
      id: notificationId,
      channel: 'IVRS',
      to_name: application.applicant_name,
      to_phone: application.phone,
      role: 'Applicant',
      text: script,
      app_id: application.id,
      pgrs_no: application.pgrs_no,
      status: isSimulation ? 'simulated_sent' : 'delivered',
      at: new Date()
    });

    await notification.save();

    console.log(`[IVRS ${isSimulation ? 'SIMULATION' : 'LIVE'}] Placed call to: ${application.applicant_name} (${application.phone})`);

    return {
      success: true,
      mode: env.ivrsMode,
      script: script,
      notificationId: notification.id,
      simulated: isSimulation
    };
  }
};

module.exports = ivrsService;
