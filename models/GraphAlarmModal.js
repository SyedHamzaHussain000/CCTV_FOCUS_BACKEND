const mongoose = require("mongoose");

const GraphAlarmModal = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },

  label: String,
  value: Number,
  frontColor: {
    type: String,
    default: "#1B0F22"
  },
  type: String,

  // ... other fields as needed
});

const Graph_Alarm = mongoose.model("GraphAlarm", GraphAlarmModal);

module.exports = Graph_Alarm;
