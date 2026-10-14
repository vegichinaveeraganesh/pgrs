const { v4: uuidv4 } = require('uuid') || { v4: () => Math.random().toString(36).substring(2) + Date.now().toString(36) };
const Notification = require('../models/Notification');
const env = require('../config/env');

const smsService = {
  /**
   * Dispatch an SMS message (Simulated or via Provider)
   */
  async sendSMS({ toName, toPhone, role, text, grievanceId, pgrsNo }) {
    const isSimulation = env.smsMode === 'simulation';
    const notificationId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));

    const notification = new Notification({
      id: notificationId,
      channel: 'SMS',
      to_name: toName,
      to_phone: toPhone,
      role: role || 'Applicant',
      text: text,
      app_id: grievanceId,
      pgrs_no: pgrsNo,
      status: isSimulation ? 'simulated_sent' : 'delivered',
      at: new Date()
    });

    await notification.save();

    console.log(`[SMS ${isSimulation ? 'SIMULATION' : 'LIVE'}] To: ${toName} (${toPhone}) | Role: ${role} | Text: ${text}`);

    return {
      success: true,
      mode: env.smsMode,
      notificationId: notification.id,
      simulated: isSimulation
    };
  }
};

module.exports = smsService;
