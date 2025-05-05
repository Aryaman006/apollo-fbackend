const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  experience: Number,
  qualifications: String,
  location: String, // or mongoose.Schema.Types.Mixed if storing object
  fees: Number,
  cashback: Number,
  consultTime: String,
  mode: [String],
  language: [String],
  facility: [String],
  rating: {
    type: Number,
    default: 0,
  },
  image: String,
}, { timestamps: true }); // optional but useful

module.exports = mongoose.model("Doctor", doctorSchema);
