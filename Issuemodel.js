const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: String,
  updated_on: String,
  created_by: { type: String, required: true },
  assigned_to: String,
  open: { type: Boolean, default: true },
  status_text: String,
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
