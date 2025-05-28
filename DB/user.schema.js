const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    specialization: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Mydata = mongoose.model("mydata", userSchema);

module.exports = { Mydata };
