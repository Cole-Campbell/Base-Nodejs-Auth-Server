import crypto from "crypto";

export const createHash = (salt, password) =>
  crypto.createHmac("sha512", salt).update(password).digest("base64");
