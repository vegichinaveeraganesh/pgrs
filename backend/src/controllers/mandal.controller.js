const Mandal = require('../models/Mandal');
const Village = require('../models/Village');

const mandalController = {
  async getMandals(req, res, next) {
    try {
      const mandals = await Mandal.find({}).sort({ name: 1 });
      res.json(mandals);
    } catch (err) {
      next(err);
    }
  },

  async getVillages(req, res, next) {
    try {
      const { mandal, mandalId } = req.query;
      let query = {};
      if (mandal) query.mandal = mandal;
      if (mandalId) query.mandalId = mandalId;

      const villages = await Village.find(query).sort({ name: 1 });
      res.json(villages);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = mandalController;
