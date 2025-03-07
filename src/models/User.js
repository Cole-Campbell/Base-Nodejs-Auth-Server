import mongoose from "mongoose";

const { Schema } = mongoose;

const UserNameSchema = new Schema({
  firstName: { required: true, type: String },
  lastName: { required: true, type: String },
});

const UserSchema = new Schema({
  _id: { required: true, type: mongoose.Types.ObjectId },
  name: { required: true, type: UserNameSchema },
  email: { required: true, type: String },
  password: { required: true, type: String },
  roles: { required: true, type: [String], Enumerator: ["Admin", "User"] },
});

export const UserModel = mongoose.model("Users", UserSchema);
