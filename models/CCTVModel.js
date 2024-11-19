const mongoose = require("mongoose");

const CCTVModal = new mongoose.Schema({
  report_generator_id: {
    type: mongoose.Schema.ObjectId,
  },
  full_name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  lineofaddr: {
    type: String,
  },
  secondlineofaddrA: {
    type: String,
  },
  town: {
    type: String,
  },
  PostalCode: {
    type: String,
  },
  What_Sector: {
    type: String,
  },
  What_Sector_Step_Two: {
    type: String,
  },
  What_Comercial_Sector: {
    type: String,
  },
  What_Comercial_Other_Info: {
    type: String,
  },
  What_Comercial_Postal_Code: {
    type: String,
  },
  BedRooms: {
    type: String,
  },
  CCTV_purpose: {
    type: String,
  },
  ExistingCCTV: {
    type: String,
  },
  ExistingCCTVTxt: {
    type: String,
  },
  CCTV_Analougeorip: {
    type: String,
  },
  CCTV_RecorderInfo_Channel: {
    type: String,
  },
  CCTV_RecorderInfo_Resolution: {
    type: String,
  },
  CCTV_RecorderInfo_AnalyticsFeature: {
    type: String,
  },
  CCTV_RecorderInfo_AudioSupport: {
    type: String,
  },
  CCTV_RecorderInfo_Storage: {
    type: String,
  },
  CCTV_Cable_Type: {
    type: String,
  },
  CCTV_Enter_Length: {
    type: String,
  },
  CCTV_Cable_Cat5_Type: {
    type: String,
  },
  CCTV_Cable_Cat5_Colour: {
    type: String,
  },
  CCTV_Enter_Cat5_Length: {
    type: String,
  },
  CCTV_Cable_Cat6_Type: {
    type: String,
  },
  CCTV_Cable_Cat6_Colour: {
    type: String,
  },
  CCTV_Enter_Cat6_Length: {
    type: String,
  },
  CCTV_Cable_RJ59_Type: {
    type: String,
  },
  CCTV_Enter_RJ59_Length: {
    type: String,
  },
  CCTV_ConnectToMobile: {
    type: String,
  },
  CCTV_ConnectCurrentTV: {
    type: String,
  },
  CCTV_RecorderInMeter: {
    type: String,
  },
  CCTV_Extender_Required: {
    type: String,
  },
  CCTV_NewScreen: {
    type: String,
  },
  CCTV_WhatSize: {
    type: String,
  },
  CCTV_WallBracket: {
    type: String,
  },
  CCTV_Supplying: {
    type: String,
  },
  FireAlarm: {
    type: String,
  },
  Smart_Lock: {
    type: String,
  },
  Security_Lighting: {
    type: String,
  },
  Special_Requirement: {
    type: String,
  },
  Follow_Method_email: {
    type: String,
  },
  Follow_Method_phone: {
    type: String,
  },
  Follow_Method_sms: {
    type: String,
  },

  Camera: [
    {
      Camera_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Camera",
      },
      PRODUCT_CODE: String,
      IMAGE: String,
      DESCRIPTION: String,
      RESOLUTION: String,
      Availablity: String,
      WEBSITE: String,
      PRICE: String,
      Compatible_Bracket: String,
      Wall_Bracket: String,
      TYPE: String,
      heightOfInstallation: String,
      heighBrief: String,
      HeightOfInstallationImage: String,
    },
  ],
  cameraHeightOfInstallationImages: [],

  Recorder: [
    {
      Recorder_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Recorder",
      },
      PRODUCT_CODE: String,
      IMAGE: String,
      DESCRIPTION: String,
      RESOLUTION: String,
      Availablity: String,
      WEBSITE: String,
      PRICE: String,
      Compatible_Bracket: String,
      Wall_Bracket: String,
      TYPE: String,
    },
  ],
  recorderHeightOfInstallationImages: [],
});

const CCTV_Modal = mongoose.model("CCTV", CCTVModal);

module.exports = CCTV_Modal;
