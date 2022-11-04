const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    stocks:{
        type:Number,
        required:true,
        default:0
        },
    fiat:{
        type:Number,
        required:true,
        default:0
    },
    stocksBought:[
        {
            name:{
                type:String,
                required:true
            },
            id:{
                type:String,
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
                required:true
            },
            totalPrice:{
                type:Number,
                required:true
            }
         }
    ],
    stocksSold:[
        {
            name:{
                type:String,
                required:true
            },
            id:{
                type:String,
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
                required:true
            },
            totalPrice:{
                type:Number,
                required:true
            }
         }
    ]

},{timestamps:true})


module.exports =  mongoose.model("Users", userSchema);