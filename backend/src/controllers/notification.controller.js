const Notification = require('../models/Notification');
const smsService = require('../services/sms.service');
const ivrsService = require('../services/ivrs.service');

const notificationController = {
  async getMessages(req, res, next) {
    try {
      const { channel, role, q, limit } = req.query;
      let query = {};
      if (channel) query.channel = channel;
      if (role) query.role = role;
      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        query.$or = [
          { to_name: regex },
          { to_phone: regex },
          { pgrs_no: regex },
          { text: regex }
        ];
      }

      const maxLimit = parseInt(limit, 10) || 50;
      const messages = await Notification.find(query)
        .sort({ at: -1 })
        .limit(maxLimit);

      res.json(messages);
    } catch (err) {
      next(err);
    }
  },

  async retryMessage(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({
        $or: [{ id: id }, { _id: id }]
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      notification.retry_count = (notification.retry_count || 0) + 1;
      notification.status = 'simulated_sent';
      notification.at = new Date();
      await notification.save();

      res.json({
        success: true,
        message: 'Notification retry simulated successfully',
        notification
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
