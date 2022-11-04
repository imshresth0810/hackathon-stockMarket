const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({

            price: {
                type:Number,
                required:true 
            },
            date:{
                type:Date,
                default:Date.now(),
                required:true
            }
    
}, { timestamps: true })

module.exports = mongoose.model("MarketPrices", marketSchema);