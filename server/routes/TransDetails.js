const express = require('express');
const router = express.Router();
const Users = require('../models/UserModel')
const MarketPrice = require("../models/MarketPrice");
const PendingStocks = require("../models/PendingStock");
const TranHistory = require("../models/TranHistory");

router.get("/userlist", async (req, res) => {
    try {
        const users = await Users.find({});
        return res.status(200).json({
            users
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            "message":"Server error"
        })
    }
})
router.get("/pricegraph", async (req, res) => {
    try {
        const prices = await MarketPrice.find({}).sort({date:-1}).limit(20);
        return res.status(200).json({
            prices
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            "message":"Server error"
        })
    }
})
router.get("/transactions", async (req, res) => {
    try {
        const transactions = await TranHistory.find({}).sort({date:-1});
        return res.status(200).json({
            transactions
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            "message":"Server error"
        })
    }
})

router.get("/pending", async (req, res) => {
    
    try {
        const buy = await PendingStocks.find({trade:'buy'});
        const sell = await PendingStocks.find({trade:'sell'});
        
        return res.status(200).json({
            "buy":buy,
            "sell":sell
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            "message":"Server error"
        })
    }
})

router.delete("/delete", async(req, res)=>{
    try {
        await Users.deleteMany({});
        await MarketPrice.deleteMany({});
        await PendingStocks.deleteMany({});
        return res.status(200).json({
            "message": "DB Deleted",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "message":"Server error"
        }) 
    }
})

module.exports = router;
