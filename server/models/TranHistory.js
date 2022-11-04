const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const Users = require('../models/UserModel')

const tranHistorySchema = new mongoose.Schema({
    Bid:{
        type:String,
        required:true
    },
    Sid:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    qty:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true,
        default:Date.now()
    },
    Buser:{
        type:String
    },
    Suser:{
        type:String
    }
}, { timestamps: true })

tranHistorySchema.pre('save', async function (next){
    try{
    const bid = this.Bid;
    const sid = this.Sid;

    const buyer = await Users.findOne({"_id":bid});
    const seller = await Users.findOne({"_id":sid});

    this.Buser = buyer.username;
    this.Suser = seller.username;

    next();}
    catch(e){
        console.log(e);
        return res.status(500).json({
            "message":"server error"
        })
    }
})

module.exports = mongoose.model("TranHistory", tranHistorySchema);