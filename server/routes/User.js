const express = require('express');
const MarketPrice = require('../models/MarketPrice');
const PendingStocks = require('../models/PendingStock');
const TranHistory = require('../models/TranHistory');
const router = express.Router();
const Users = require('../models/UserModel')


router.post("/addUser", async (req, res) => {
    let { username,fiat,stocks} = req.body;

    if (!username || !stocks || !fiat)
    {
        return res.status(422).json({
        "message": "Form incomplete"
    })
    }
    stocks = parseInt(stocks);
    fiat = parseInt(fiat)
    try {
        const userexist = await Users.findOne({username:username})
        if(userexist){
            const usersaved = await Users.findOneAndUpdate({username:username}, {stocks, fiat},{runValidators:true});
            return res.status(200).json({
                "message": "User created",
            })
        }
        const newUser = new Users({
            username, stocks, fiat
        })
        let nuser = await newUser.save();

        return res.status(200).json({
            "message": "User created",
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
        await TranHistory.deleteMany({});
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
