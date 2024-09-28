const database = require("./database");

function log(message, type, req) {
  database.collection("logs").insertOne({
    type,
    message,
    attacker: {
      ip: req.ip,
      country: "Saudi Arabia",
      region: "Riyadh",
      city: "Riyadh",
    },
    timestamp: new Date(),
  });
}

function blacklist(ip, type) {
  database.collection("blacklist").insertOne({
    ip,
    type,
    timestamp: new Date(),
  });
}

module.exports = {
  log,
  blacklist,
};
