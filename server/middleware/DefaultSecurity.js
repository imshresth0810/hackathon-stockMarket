exports.authenticate = async(req,res,next)=>{
    try{
        const token = req.headers.wastemartkey;
        const key = process.env.WASTEMART_KEY?.toString();
        if(token == key)
        next();
        else return res.status(401).json({"message": "Unathorised access"});
    }catch(e){
        console.log(e);
        return res.status(401).json({"message": "Unathorised access"});
    }
}