const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },


  value: Number,
  label: {
    color: String,
  },
  spacing: Number, // Optional, but can be useful for spacing between bars
  labelWidth: Number, // Optional, but can be useful for label width
  labelTextStyle: {
    color: String,
  },
  frontColor: String,
  type: String,

  // ... other fields as needed
});

const Graph_CCTV = mongoose.model("GraphCCTV", GraphSchema);

module.exports = Graph_CCTV;
