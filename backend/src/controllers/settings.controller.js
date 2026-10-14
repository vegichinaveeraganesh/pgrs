const Setting = require('../models/Setting');
const env = require('../config/env');

const settingsController = {
  async getSettings(req, res, next) {
    try {
      const settings = await Setting.find({});
      const configMap = {
        sla_default_days: env.slaDefaultDays,
        sms_mode: env.smsMode,
        ivrs_mode: env.ivrsMode,
        pgrs_sync_mode: env.pgrsSyncMode,
        division: 'Bhimunipatnam (Bhimili) Revenue Division',
        district: 'Visakhapatnam'
      };

      settings.forEach(s => {
        configMap[s.key] = s.value;
      });

      res.json(configMap);
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const updates = req.body;

      for (const [key, value] of Object.entries(updates)) {
        await Setting.findOneAndUpdate(
          { key },
          { key, value, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }

      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = settingsController;
