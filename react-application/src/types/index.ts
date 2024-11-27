export type logs = {
  _id: string;
  serverID: string;
  type: string;
  message: string;
  attacker: {
    ip: string;
    country: string;
    city: string;
    flag: string;
  };
  timestamp: string;
};

export type blacklist = {
  _id: string;
  ip: string;
  type: string;
  timestamp: string;
};
