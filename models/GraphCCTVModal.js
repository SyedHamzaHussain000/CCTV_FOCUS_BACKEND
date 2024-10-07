const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },

  value: {
    type : Number,
    default:0
  },
  type: String,
  label: String,

  //defaults
  spacing: {
    type: Number,
    default:6
  }, // Optional, but can be useful for spacing between bars
  labelWidth: {
    type: Number,
    default:40
  }, // Optional, but can be useful for label width
  labelTextStyle: {
    color: {
      type: String,
      default: "gray"
    },
  },
  frontColor: {
    type: String,
    default: "#FFDB25"
  },
  

  // ... other fields as needed
});

const Graph_CCTV = mongoose.model("GraphCCTV", GraphSchema);

module.exports = Graph_CCTV;
