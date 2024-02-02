import mongoose from "mongoose";

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

const ConvertModel = mongoose.model("Convert", convertSchema);

export default ConvertModel;
