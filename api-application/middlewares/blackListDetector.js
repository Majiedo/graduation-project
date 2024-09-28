const database = require("../database");

async function blackListDetector(req, res, next) {
  const attacker = await database
    .collection("blacklist")
    .findOne({ ip: req.ip });

  if (attacker) {
    return res.status(403).json({
      message: "You are blacklisted.",
    });
  }

  next();
}

module.exports = blackListDetector;
