const mongoose = require("mongoose");

const pendingSchema = new mongoose.Schema({
    id:{
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
    trade:{
        type:String,
        enum:['buy', 'sell'],
        required:true
    }
}, { timestamps: true })

module.exports = mongoose.model("PendingStocks", pendingSchema);