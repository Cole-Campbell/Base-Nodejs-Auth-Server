import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";

import { UserModel } from "../models/User.js";
import { createHash } from "../utils/users.js";
import {
  minimumPermissionNeeded,
  validJWTNeeded,
  userCanAccess,
} from "../middleware/auth.validation.middleware.js";

export const UserRoutes = express.Router();

UserRoutes.post("/", async (req, res) => {
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = createHash(salt, req.body.password);

  req.body.password = `${salt}$${hash}`;
  req.body.roles = ["User"];
  req.body._id = new mongoose.Types.ObjectId();

  // CHECK FOR EMAIL IN USE
  const emailInUse = await UserModel.findOne({ email: req.body.email });
  if (!!emailInUse) {
    res.status(500).json({ message: "Email already taken" });
  } else {
    try {
      const data = await UserModel.create(req.body);
      res.status(201).send({ _id: data._id });
    } catch (err) {
      res.status(500).json({ message: "Error creating user", error: err });
    }
  }
});

UserRoutes.get("/", [
  validJWTNeeded,
  minimumPermissionNeeded("Admin"),
  async (req, res) => {
    try {
      const data = await UserModel.find();
      const safeData = data.map((d) => ({
        name: d.name,
        _id: d._id,
        email: d.email,
        roles: d.roles,
      }));
      res.status(200).json(safeData);
    } catch (err) { }
  },
]);

UserRoutes.get("/:userId", [validJWTNeeded, userCanAccess, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) res.status(404).json({ message: "User not found" });
    else res.json({ name: user.name, email: user.email, roles: user.roles });
  } catch (err) {
    res.status(500).json({ message: "Error finding user" });
  }
}]);

// UPDATE USER
UserRoutes.patch("/:userId", [
  validJWTNeeded,
  userCanAccess,
  async (req, res) => {
    if (req.body.password) {
      const salt = crypto.randomBytes(16).toString("base64");
      const hash = createHash(salt, req.body.password);
      req.body.password = `${salt}$${hash}`;
    }

    try {
      await UserModel.findOneAndUpdate({ _id: req.params.userId }, req.body);
      res.status(204).json({ message: "Success" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
]);

// DELETE USER
UserRoutes.delete("/:userId", [validJWTNeeded, userCanAccess, async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.userId);
    res.status(204).send({});
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
}]);
