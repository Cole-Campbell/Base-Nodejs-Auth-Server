import mongoose from "mongoose";

const { Schema } = mongoose;

const TokenSchema = new Schema({
    _id: { required: true, type: mongoose.Types.ObjectId },
    token: { required: true, type: String },
});

export const TokenModel = mongoose.model("Tokens", TokenSchema);
