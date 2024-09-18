const mongoose = require("mongoose");

const GraphAlarmModal = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },


  value: Number,
  frontColor: String,
  type: String,

  // ... other fields as needed
});

const Graph_Alarm = mongoose.model("GraphAlarm", GraphAlarmModal);

module.exports = Graph_Alarm;
