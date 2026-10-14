const Official = require('../models/Official');
const Mandal = require('../models/Mandal');
const Village = require('../models/Village');
const Grievance = require('../models/Grievance');
const routingService = require('../services/routing.service');

const officialController = {
  async getDirectory(req, res, next) {
    try {
      await routingService.recalculateOfficialCounts();

      const mandals = await Mandal.find({}).sort({ name: 1 });
      const mandalData = [];

      for (const m of mandals) {
        // Tahsildar
        const tahsildar = await Official.findOne({
          role: 'Tahsildar',
          mandal: m.name,
          active: true
        });

        // Villages
        const villages = await Village.find({ mandal: m.name }).sort({ name: 1 });
        const villageList = [];

        for (const v of villages) {
          const vro = await Official.findOne({
            role: 'VRO',
            mandal: m.name,
            $or: [{ village: v.name }, { assignedVillages: v.name }],
            active: true
          });

          // Pending count for village
          const villagePending = await Grievance.countDocuments({
            mandal: m.name,
            village: v.name,
            stage: { $nin: ['ENDORSED', 'CLOSED'] }
          });

          villageList.push({
            name: v.name,
            vro: {
              name: vro?.name || v.vroName || 'Unassigned VRO',
              phone: vro?.phone || v.vroPhone || '-'
            },
            pending: villagePending
          });
        }

        const totalGrievances = await Grievance.countDocuments({ mandal: m.name });
        const resolvedGrievances = await Grievance.countDocuments({
          mandal: m.name,
          stage: { $in: ['ENDORSED', 'CLOSED'] }
        });
        const pendingGrievances = totalGrievances - resolvedGrievances;

        mandalData.push({
          mandal: m.name,
          tahsildar: {
            name: tahsildar?.name || m.tahsildarName || 'Tahsildar ' + m.name,
            phone: tahsildar?.phone || m.tahsildarPhone || '+91 94901 00000'
          },
          villages: villageList,
          total: totalGrievances,
          pending: pendingGrievances,
          resolved: resolvedGrievances
        });
      }

      res.json({
        division: 'Bhimunipatnam (Bhimili) Revenue Division',
        mandals: mandalData
      });
    } catch (err) {
      next(err);
    }
  },

  async getOfficials(req, res, next) {
    try {
      const { role, mandal, active } = req.query;
      let query = {};
      if (role) query.role = role;
      if (mandal) query.mandal = mandal;
      if (active !== undefined) query.active = active === 'true';

      const officials = await Official.find(query).sort({ role: 1, name: 1 });
      res.json(officials);
    } catch (err) {
      next(err);
    }
  },

  async createOfficial(req, res, next) {
    try {
      const { name, role, phone, email, mandal, village, assignedVillages } = req.body;
      if (!name || !role || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Name, role, and phone are required'
        });
      }

      const official = new Official({
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        mandal: mandal ? mandal.trim() : undefined,
        village: village ? village.trim() : undefined,
        assignedVillages: assignedVillages || (village ? [village.trim()] : [])
      });

      await official.save();
      await routingService.recalculateOfficialCounts();

      res.status(201).json({ success: true, official });
    } catch (err) {
      next(err);
    }
  },

  async updateOfficial(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const official = await Official.findByIdAndUpdate(id, updates, { new: true });
      if (!official) {
        return res.status(404).json({ success: false, message: 'Official not found' });
      }

      await routingService.recalculateOfficialCounts();
      res.json({ success: true, official });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = officialController;
