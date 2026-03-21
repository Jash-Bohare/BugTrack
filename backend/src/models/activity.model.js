const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
    index: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  action: {
    type: String,
    enum: ["CREATED", "UPDATED", "ASSIGNED", "STATUS_CHANGED", "DELETED"],
    required: true,
  },

  meta: {
    type: Object,
    default: {},
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const activityModel = mongoose.model("activity", activitySchema);

module.exports = activityModel;
