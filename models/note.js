const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tag: String,
  reminder: Date,
  color: String,
  pinned: Boolean,
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
