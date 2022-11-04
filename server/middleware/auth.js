const jwt = require('jsonwebtoken')
const customers = require("../models/UserModel")

exports.authenticate = async(req,res,next)=>{
    try{
        const token = req.headers.auth;
        // console.log(token)
        const verifyIt = jwt.verify(token, process.env.SEC_KEY);
        if(verifyIt)
        next();
        else return res.status(401).json({"message": "Unathorised access"});
    }catch(e){
        console.log(e);
        return res.status(401).json({"message": "Unathorised access"});
    }
}