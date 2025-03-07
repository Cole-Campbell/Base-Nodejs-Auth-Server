import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const { parsed: { JWT_SECRET } } = dotenv.config({ path: "./.env.local" });

export const validJWTNeeded = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") return res.status(401).send();
      req.jwt = jwt.verify(authorization[1], JWT_SECRET);
      return next();
    } catch (err) {
      // INVALID TOKEN
      return res.status(403).send();
    }
  }

  // INVALID REQUEST
  return res.status(401).send();
};

export const minimumPermissionNeeded = (requiredPermissionLevel) => {
  return (req, res, next) => {
    let userPermissionLevel = req.jwt.roles;
    if (userPermissionLevel.includes(requiredPermissionLevel)) {
      return next();
    }

    return res.status(403).send();
  };
};

export const userCanAccess = (req, res, next) => {
  if (req.params && req.params.userId === req.jwt._id || req.jwt.roles.includes("Admin")) {
    return next();
  }

  return res.status(403).send();
};
