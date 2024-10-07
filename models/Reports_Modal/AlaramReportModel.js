const mongoose = require('mongoose');

const AlaramReportModel = new mongoose.Schema({

    report_generator_id: {
        type: mongoose.Schema.ObjectId
    },
    pdf_url: {
        type: String,
    },
    pdf_type:{
        type: String,
    },
    full_name: {
        type: String,
    }

},{
    timestamps:true
})

const AlaramReport_Model = mongoose.model('AlarmReport', AlaramReportModel)

module.exports = AlaramReport_Model