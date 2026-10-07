const datacenterService = require("../services/datacenter.service");

async function getTopology(req, res, next) {
  try {
    const topology = datacenterService.getTopology();
    return res.json(topology);
  } catch (err) {
    next(err);
  }
}

async function triggerFailover(req, res, next) {
  try {
    const { targetDcId } = req.body;
    const result = datacenterService.triggerFailover(targetDcId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTopology,
  triggerFailover,
};
