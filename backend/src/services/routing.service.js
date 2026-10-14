const Official = require('../models/Official');
const Mandal = require('../models/Mandal');
const Village = require('../models/Village');

const routingService = {
  /**
   * Determine responsible Tahsildar and VRO based on Mandal and Village
   */
  async resolveOfficers(mandalName, villageName) {
    let tahsildar = null;
    let vro = null;
    let routingStatus = 'success';
    let missingReason = null;

    // 1. Resolve Tahsildar for the Mandal
    const foundTahsildar = await Official.findOne({
      role: 'Tahsildar',
      mandal: new RegExp(`^${mandalName}$`, 'i'),
      active: true
    });

    if (foundTahsildar) {
      tahsildar = {
        name: foundTahsildar.name,
        phone: foundTahsildar.phone,
        officialId: foundTahsildar._id
      };
    } else {
      routingStatus = 'partial_unmapped';
      missingReason = `No active Tahsildar found for mandal: ${mandalName}`;
    }

    // 2. Resolve VRO for the specific Village
    const foundVro = await Official.findOne({
      role: 'VRO',
      mandal: new RegExp(`^${mandalName}$`, 'i'),
      $or: [
        { village: new RegExp(`^${villageName}$`, 'i') },
        { assignedVillages: new RegExp(`^${villageName}$`, 'i') }
      ],
      active: true
    });

    if (foundVro) {
      vro = {
        name: foundVro.name,
        phone: foundVro.phone,
        officialId: foundVro._id
      };
    } else {
      routingStatus = vro ? routingStatus : 'unmapped';
      missingReason = missingReason
        ? `${missingReason}; No VRO mapped for village: ${villageName}`
        : `No VRO mapped for village: ${villageName}`;
    }

    return {
      tahsildar,
      vro,
      isFullyRouted: Boolean(tahsildar && vro),
      routingStatus,
      missingReason
    };
  },

  /**
   * Update pending/resolved counters for officials
   */
  async recalculateOfficialCounts() {
    const Grievance = require('../models/Grievance');
    const officials = await Official.find({});

    for (const official of officials) {
      let query = {};
      if (official.role === 'Tahsildar') {
        query['tahsildar.name'] = official.name;
      } else if (official.role === 'VRO') {
        query['vro.name'] = official.name;
      } else {
        continue;
      }

      const total = await Grievance.countDocuments(query);
      const resolved = await Grievance.countDocuments({
        ...query,
        stage: { $in: ['ENDORSED', 'CLOSED'] }
      });
      const pending = total - resolved;

      official.totalCount = total;
      official.resolvedCount = resolved;
      official.pendingCount = pending;
      await official.save();
    }
  }
};

module.exports = routingService;
