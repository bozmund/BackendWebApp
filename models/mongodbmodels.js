import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    require: [true, "Password is required"],
  },
}, { timestamps: true });

const convertSchema = new mongoose.Schema({
  conversionType: {
    type: String,
    enum: ["Playlist", "Song"],
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

export const ConvertModel = mongoose.model("Convert", convertSchema);
export const UserModel = mongoose.model("User", userSchema);
