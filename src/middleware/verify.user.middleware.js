import { UserModel } from "../models/User.js";
import { createHash } from "../utils/users.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenModel } from "../models/Refresh_Token.js";
import mongoose from "mongoose";

export const isUserValid = (req, res, next) => {
  UserModel.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) res.status(404).send({});
      else {
        const { _id, email, password, roles, name } = user;
        let passwordFields = user.password.split("$");
        let salt = passwordFields[0];
        let hash = createHash(salt, req.body.password);
        if (hash === passwordFields[1]) {
          req.body = {
            provider: "email",
            _id,
            email,
            password,
            roles,
            name,
          };
          return next();
        }
        res.status(403).send();
      }
    })
    .catch(() => res.status(400).send({ message: "Invalid credentials" }));
};

const insertRefreshToken = async (token, res) => {
  try {
    const body = {
      _id: new mongoose.Types.ObjectId(),
      token
    }
    await TokenModel.create(body);
  } catch (err) {
    res.status(500).send()
  }
}

const getRefreshToken = async (token, res) => {
  try {
    const data = await TokenModel.findOne(token);
    return data
  } catch (err) {
    res.status(500).send()
  }
}

const removeRefreshToken = async (token, res) => {
  try {
    await TokenModel.findOneAndDelete(token);
    res.status(204).send();
  } catch (err) {
    res.status(403).send()
  }

}

export const login = async (req, res) => {
  const { parsed: { REFRESH_SECRET } } = dotenv.config({ path: "./.env.local" });
  try {
    let salt = crypto.randomBytes(16).toString("base64");
    req.body.refreshKey = salt;
    let token = generateAccessToken(req.body)
    let refresh_token = jwt.sign(req.body, REFRESH_SECRET)
    await insertRefreshToken(refresh_token, res)
    return res.status(201).send({ accessToken: token, refreshToken: refresh_token });
  } catch (err) {
    return res.status(500).send({ message: "Error logging in" });
  }
};

export const logout = async (req, res) => {
  await removeRefreshToken(req.body.token, res)
}

export const refreshToken = async (req, res) => {
  const { parsed: { REFRESH_SECRET } } = dotenv.config({ path: "./.env.local" });
  const { token: refreshToken } = await getRefreshToken(req.body, res)
  console.log(refreshToken)

  if (!refreshToken) return res.status(401).send()
  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) req.status(403)
    const accessToken = generateAccessToken({ provider: user.provider, _id: user._id, email: user.email, roles: user.roles, name: user.name })
    return res.json({ accessToken })
  })
}

const generateAccessToken = (user) => {
  const { parsed: { JWT_SECRET } } = dotenv.config({ path: "./.env.local" });
  return jwt.sign(user, JWT_SECRET, { expiresIn: '15s' });
}
