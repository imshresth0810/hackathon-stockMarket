const express = require("express")
const router = express.Router();
const Users = require('../models/UserModel')
const MarketPrice = require("../models/MarketPrice");
const PendingStocks = require("../models/PendingStock");
const TranHistory = require("../models/TranHistory");
const { findOneAndUpdate, findByIdAndUpdate } = require('../models/MarketPrice');

//Checks for trade of aggressive trdaers at the beginnning when no market price is available
const checkAggressive = async()=>{
    try{
    const marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);
    if(marketP.length != 1) return;
    else{
        const pr = marketP[0].price;
        let aggBuyers = await PendingStocks.find({ "trade":"buy", "price": -1}); //getting all agressive buyer

        for (let index = 0; index < aggBuyers.length; index++) {
            const element = aggBuyers[index];
            const iid = new RegExp(element.id);
            let aggSellers = await PendingStocks.find({ "trade":"sell", "price": -1,"id":{$not:iid} }); //getting all agressive seller which is not buyer

            for (let index2 = 0; index2 < aggSellers.length; index2++) {
                const seller = aggSellers[index2];
                if(element.qty == seller.qty){
                   
                    //Deleting Pending list
                    await PendingStocks.findByIdAndDelete(element._id);
                    await PendingStocks.findByIdAndDelete(seller._id);
                    //Updating seller info
                    await Users.findByIdAndUpdate(seller.id,{$inc:{ "fiat": pr*element.qty, "stocks": -element.qty}});
                    //Updating buyer info
                    await Users.findByIdAndUpdate(aggBuyers[j].id,{$inc:{ "fiat": -pr*element.qty, "stocks": element.qty}});
                
                    //creating transaction history
                    const newTransaction = new TranHistory({
                        qty:element.qty,
                        Sid: seller.id,
                        Bid: element.id,
                        price: pr,
                        date: Date.now()
                    })
                    await newTransaction.save();
                    break;
            }else if(element.qty > seller.qty){

                //Updating Pending list
                await PendingStocks.findByIdAndUpdate(element._id, {$inc:{ "qty": -seller.qty }});
                await PendingStocks.findByIdAndDelete(seller._id);
                //Updating seller info
                await Users.findByIdAndUpdate(seller.id,{$inc:{ "fiat": pr*seller.qty, "stocks": -seller.qty}});
                //Updating buyer info
                await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -pr*seller.qty, "stocks": seller.qty}});
                
                //creating transaction history
                const newTransaction = new TranHistory({
                    qty: seller.qty,
                    Sid: seller.id,
                    Bid: element.id,
                    price: pr,
                    date: Date.now()
                })
                await newTransaction.save();
                element.qty -= seller.qty
   
            }else{
                //Updating Pending list
                await PendingStocks.findByIdAndDelete(element._id);
                await PendingStocks.findByIdAndUpdate(seller._id, {$inc:{ "qty": -element.qty }});
                //Updating seller info
                await Users.findByIdAndUpdate(seller.id,{$inc:{ "fiat": pr*element.qty, "stocks": -element.qty}});
                //Updating buyer info
                await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -pr*element.qty, "stocks": element.qty}});
            
                //creating transaction history
                const newTransaction = new TranHistory({
                    qty: element.qty,
                    Sid: seller.id,
                    Bid: element.id,
                    price: pr,
                    date: Date.now()
                })
                await newTransaction.save();
                seller.qty -= element.qty;
                break;
            }
                
            }

            
        }

        return;
    }
    }catch(e){
        console.log(e)
    }
}
//When order type is limit
router.post("/limit", async (req, res) => {
    try {
        let { trade, username, price ,qty } = req.body;

        if (!username || !price || !trade || !qty)
        {
            return res.status(422).json({
            "message": "Form incomplete",
            "title":" Transaction unsuccessful"
        })
        }

        qty = parseInt(qty);
        price = parseInt(price);
        let trader = await Users.findOne({username})
        let tradedStock = qty;
        //For buy case
        if(trade === "buy"){
            if(trader.fiat < price*qty)
            return res.status(200).json({
                "message": "Not enough balance",
                "title":" Transaction unsuccessful"
            });
            const iid = new RegExp(trader._id);
            const findPrices = await PendingStocks.find(
                { $or: [{ "trade":"sell", "price":{$lte: price} ,"id":{$not:iid} }, { "trade":"sell", "price": -1 ,"id":{$not:iid} }] }
            ).sort({price:1,date:1});

            // { $or: [{ "trade":"sell", "price":price ,"id":{$not:iid} }, { "trade":"sell", "price": -1 ,"id":{$not:iid} }] }

            for (let index = 0; index < findPrices.length; index++) {
                if(qty === 0) break;

                let element = findPrices[index];
                const seller = await Users.findById(element.id);
                console.log(seller.stocks," ++" ,qty, "==", element.qty);

                if(qty < element.qty){
                    // if not enough stocks in seller
                    if(seller.stocks < qty ) continue;
                    
                    //When aggresive seller is in pending and limit buyer comes
                    if(element.price === -1){
                        element.price = price;
                    }

                    //Updating Pending list
                    await PendingStocks.findOneAndUpdate({"trade":"sell", "_id":element._id, "date":element.date},{"qty":element.qty-qty});
                    //Updating seller info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": price*qty, "stocks": -qty}});
                    //Updating buyer info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": -price*qty, "stocks": qty}});
                
                    //creating transaction history
                    const newTransaction = new TranHistory({
                        qty:qty,
                        Sid: element.id,
                        Bid: trader._id,
                        price: price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:price, date:Date.now()});
                    await marketPrice.save();

                    // checking aggressive trades if possible
                    await checkAggressive();

                    return res.status(200).json({
                        "message": "Transaction done",
                        "title":" Transaction Successful"
                    })
                }
                else{
                    // if not enough stocks in seller
                    if(seller.qty < element.qty ) continue;

                    //When aggresive seller is in pending and limit buyer comes
                    if(element.price === -1){
                        element.price = price;
                    }
                    //Updating seller info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": price*element.qty, "stocks": -element.qty}});
                    //Updating buyer info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": -price*element.qty, "stocks": element.qty}});
                    //Updating Pending list
                    await PendingStocks.findOneAndDelete({"trade":"sell","_id":element._id, "date":element.date});

                    const newTransaction = new TranHistory({
                        qty:element.qty,
                        Sid: element.id,
                        Bid: trader._id,
                        price: price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:price, date:Date.now()});
                    await marketPrice.save();

                    qty = qty - element.qty;
                }
            }
        }else{ //Sell
            const iid = new RegExp(trader._id);
            const findPrices = await PendingStocks.find(
                { $or: [{ "trade":"buy", "price":{$gte:price} ,"id":{$not:iid} }, { "trade":"buy", "price": -1 ,"id":{$not:iid} }] }
            ).sort({price:-1,date:1});

            for (let index = 0; index < findPrices.length; index++) {
                if(qty === 0) break;

                let element = findPrices[index];
                const buyer = await Users.findById(element.id);
                if(qty < element.qty){
                    //When aggresive buyer is in pending and limit seller comes
                    if(element.price === -1){
                        element.price = price;
                        const aggBuy = await Users.findById(element.id);
                        if(aggBuy.fiat < price*qty)
                        continue;
                    }

                    // if not enough money in buyer 
                    if(buyer.fiat < element.price*qty) continue;

                    //Updating Pending list
                    await PendingStocks.findOneAndUpdate({"trade":"buy", "_id":element._id, "date":element.date},{"qty":element.qty-qty});
                    //Updating buyer info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -price*qty, "stocks": qty}});
                    //Updating seller info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": price*qty, "stocks": -qty}});
                
                    //creating transaction history
                    const newTransaction = new TranHistory({
                        qty:qty,
                        Bid: element.id, 
                        Sid: trader._id,
                        price: price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:price, date:Date.now()});
                    await marketPrice.save();

                    // checking aggressive trades if possible
                    await checkAggressive();                   

                    return res.status(200).json({
                        "message": "Transaction done",
                        "title":" Transaction Successful"
                    })
                }
                else{
                     //When aggresive buyer is in pending and limit seller comes
                     if(element.price === -1){
                        element.price = price;
                        const aggBuy = await Users.findById(element.id);
                        if(aggBuy.fiat < price*element.qty)
                        continue;
                    }

                    // if not enough money in buyer 
                    if(buyer.fiat < element.price*element.qty) continue;

                    //Updating buyer info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -price*element.qty, "stocks": element.qty}});
                    //Updating seller info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": price*element.qty, "stocks": -element.qty}});
                    //Updating Pending list
                    await PendingStocks.findOneAndDelete({"trade":"buy","_id":element._id, "date":element.date});

                    const newTransaction = new TranHistory({
                        qty:element.qty,
                        Bid: element.id,
                        Sid: trader._id,
                        price: price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:price, date:Date.now()});
                    await marketPrice.save();

                    qty = qty - element.qty;
                }
            }
        }

        if(qty != 0){
            const newPending = new PendingStocks({
                id:  trader._id,
                price: price,
                date: Date.now(),
                trade: trade,
                qty: qty
            })
            await newPending.save();
            // console.log(trader)

            // checking aggressive trades if possible
            await checkAggressive();

            return res.status(200).json({
                "title":" Transaction pending and order placed",
                "message":  `${tradedStock - qty} Stocks traded and ${ qty} is in pending`,
                // "trade":"1"s
            })
        }
        
        // checking aggressive trades if possible
        await checkAggressive();

        return res.status(200).json({
            "message": "transaction done",
            "title":" Transaction Successful"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "message":"Server error",
            "title":" Transaction unsuccessful"
        }) 
    }

})

router.post("/market", async (req, res) => {
    try {
        let { trade, username ,qty } = req.body;

        if (!username || !trade || !qty)
        {
            return res.status(422).json({
            "message": "Form incomplete",
            "title":" Transaction unsuccessful"
        })
        }
        qty = parseInt(qty);
        const trader = await Users.findOne({username})
        let marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);
        // console.log(marketP);
        let trdFiat = trader.fiat;
        let tradedStock = qty;
        if(trade === "buy"){
            const iid = new RegExp(trader._id);

            // let findPrices = await PendingStocks.find({
            // "trade":"sell","id":{$not: iid}
            // }).sort({price:1, date:1});
            let findPrices = [];

            const aggr = await PendingStocks.find({
                "trade":"sell","id":{$not: {$eq: trader._id?.toString()}}, "price":-1
                }).sort({ date:1});

            const passive = await PendingStocks.find({
                "trade":"sell","id":{$not: {$eq: trader._id?.toString()}},"price":{$not: {$eq:-1}}
                }).sort({price:1, date:1});


            // console.log(passive,"++");
            // console.log(aggr,"++");
            if(marketP.length > 0 && passive.length > 0 && marketP[0].price <= passive[0].price){
                findPrices = [...aggr,...passive];
            }
            else if(marketP.length > 0 && passive.length >0 && marketP[0].price > passive[0].price){
                let fele = passive[0];
                let passivenew = passive.slice(1,passive.length);
                findPrices = [ fele, ...aggr, ...passivenew ];
            }
            else if(marketP.length == 0 && passive.length >0){
                let fele = passive[0];
                let passivenew = passive.slice(1,passive.length);
                console.log(passivenew,"++");
                findPrices = [ fele, ...aggr, ...passivenew ];
            }
            else{
                findPrices = [...passive ,...aggr];
            }
            // console.log(findPrices,"++");

            // console.log(findPrices,"====")
            for (let index = 0; index < findPrices.length; index++) {
                if(qty === 0) break;

                let element = findPrices[index];
                const seller = await Users.findById(element.id);

                if(qty < element.qty){
                    // if not enough stocks in seller
                    if(seller.stocks < qty) continue;
                    
                    //When aggresive buyer and agg. seller comes 
                    if(element.price === -1 && marketP.length > 0){
                        element.price = marketP[0].price;
                        console.log(element.price,"===========");
                    }
                    
                    if(element.price === -1 && marketP.length === 0){
                        continue;
                    }

                    console.log("====")
                    console.log(trdFiat)
                    console.log(qty)
                    console.log(element.price);
                    
                    if(qty*element.price > trdFiat){
                        // checking aggressive trades if possible
                        await checkAggressive();

                        return res.status(200).json({
                            "title":" Transaction unsuccessful",
                            "message": "Not enough balance to buy more stocks",
                        });
                    }
                    //Updating Pending list
                    await PendingStocks.findOneAndUpdate({"trade":"sell", _id:element._id, "date":element.date},{"qty":element.qty-qty});
                    //Updating seller info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": element.price*qty, "stocks": -qty}});
                    //Updating buyer info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": -element.price*qty, "stocks": qty}});
                
                    //creating transaction history
                    const newTransaction = new TranHistory({
                        qty:qty,
                        Sid: element.id,
                        Bid: trader._id,
                        price: element.price,
                        date: Date.now()
                    })
                    await newTransaction.save();
                    // update market price 
                    const marketPrice = new MarketPrice({price:element.price, date:Date.now()});
                    await marketPrice.save();
                    marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);

                    // checking aggressive trades if possible
                    await checkAggressive();

                    return res.status(200).json({
                        "title":" Transaction Successful",
                        "message": "Transaction done",
                    })
                }
                else{
                    // if not enough stocks in seller 
                    if(seller.qty < element.qty) continue;

                     //When aggresive seller and agg. buyer comes 
                    if(element.price === -1 && marketP.length > 0){
                        element.price = marketP[0].price;
                    }

                    if(element.price === -1 && marketP.length === 0){
                        continue;
                    }

                    console.log("====")
                    console.log(trdFiat)
                    console.log(element.qty*element.price)
                    if(element.qty*element.price > trdFiat){

                        // checking aggressive trades if possible
                        await checkAggressive();

                        return res.status(200).json({
                            "title":" Transaction partially completed",
                            "message": "Not enough balance to buy more stocks",
                        });
                    }
                    //Updating seller info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": element.price*element.qty, "stocks": -element.qty}});
                    //Updating buyer info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": -element.price*element.qty, "stocks": element.qty}});
                    //Updating Pending list
                    await PendingStocks.findOneAndDelete({"trade":"sell", _id:element._id, "date":element.date});

                    const newTransaction = new TranHistory({
                        qty:element.qty,
                        Sid: element.id,
                        Bid: trader._id,
                        price: element.price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:element.price, date:Date.now()});
                    await marketPrice.save();
                    marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);

                    qty = qty - element.qty;
                    trdFiat = trdFiat - element.qty*element.price;
                }
            }
        }else{ //Sell
            const iid = new RegExp(trader._id?.toString());
            console.log(trader._id?.toString());
            console.log(typeof(trader._id?.toString()));
            console.log("___+++");
            console.log(iid);
            console.log(typeof(iid));
            // const findPrices = await PendingStocks.find({
            // "trade":"buy","id":{$not: iid}
            // }).sort({price:-1, date:1});

            let findPrices = [];

            const aggr = await PendingStocks.find({
                "trade":"buy","id":{$not: {$eq: trader._id?.toString()}}, "price":-1
                }).sort({ date:1});

            const passive = await PendingStocks.find({
                "trade":"buy","id":{$not: {$eq: trader._id?.toString()}},"price":{$not: {$eq:-1}}
                }).sort({price:-1, date:1});

            if(marketP.length > 0 && passive.length > 0 && marketP[0].price >= passive[0].price){
                findPrices = [...aggr,...passive];
            }
            else if(marketP.length > 0 && passive.length >0 && marketP[0].price < passive[0].price){
                let fele = passive[0];
                let passivenew = passive.slice(1,passive.length);
                findPrices = [ fele, ...aggr, ...passivenew ];
            }
            else if(marketP.length == 0 && passive.length >0){
                let fele = passive[0];
                let passivenew = passive.slice(1,passive.length);
                console.log(passivenew,"++");
                findPrices = [ fele, ...aggr, ...passivenew ];
            }
            else{
                findPrices = [...passive, ...aggr];
            }

            for (let index = 0; index < findPrices.length; index++) {
                if(qty === 0) break;

                let element = findPrices[index];
                const buyer = await Users.findById(element.id);

                if(qty < element.qty){
                    if(element.price === -1 && marketP.length > 0){
                        element.price = marketP[0].price;
                        console.log(element.price,"===========");
                    }

                    if(element.price === -1 && marketP.length === 0){
                        continue;
                    }

                    // if not enough money in buyer 
                    if(buyer.fiat < element.price*qty) continue;

                    //Updating Pending list
                    await PendingStocks.findOneAndUpdate({"trade":"buy", _id:element._id, "date":element.date},{"qty":element.qty-qty});
                    //Updating buyer info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -element.price*qty, "stocks": qty}});
                    //Updating seller info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": element.price*qty, "stocks": -qty}});
                
                    //creating transaction history
                    const newTransaction = new TranHistory({
                        qty:qty,
                        Bid: element.id,
                        Sid: trader._id,
                        price: element.price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:element.price, date:Date.now()});
                    await marketPrice.save();
                    marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);

                    // checking aggressive trades if possible
                    await checkAggressive();

                    return res.status(200).json({
                        "title":" Transaction Successful",
                        "message": "Transaction done",
                    })
                }
                else{
                    if(element.price === -1 && marketP.length > 0){
                        element.price = marketP[0].price;
                        console.log(element.price,"===========");
                    }
                    if(element.price === -1 && marketP.length === 0){
                        console.log("")
                        continue;
                    }

                    // if not enough money in buyer 
                    if(buyer.fiat < element.price*element.qty) continue;

                    //Updating buyer info
                    await Users.findByIdAndUpdate(element.id,{$inc:{ "fiat": -element.price*element.qty, "stocks": element.qty}});
                    //Updating seller info
                    await Users.findOneAndUpdate({username},{$inc:{ "fiat": element.price*element.qty, "stocks": -element.qty}});
                    //Updating Pending list
                    await PendingStocks.findOneAndDelete({"trade":"buy", _id:element._id, "date":element.date});

                    const newTransaction = new TranHistory({
                        qty:element.qty,
                        Bid: element.id,
                        Sid: trader._id,
                        price: element.price,
                        date: Date.now()
                    })
                    await newTransaction.save();

                    // update market price 
                    const marketPrice = new MarketPrice({price:element.price, date:Date.now()});
                    await marketPrice.save();
                    marketP = await MarketPrice.find({}).sort({date:-1}).limit(1);

                    qty = qty - element.qty;
                }
            }
        }
        if(qty != 0 ){
            const newPending = new PendingStocks({
                id:  trader._id,
                price: -1,
                date: Date.now(),
                trade: trade,
                qty: qty
            })
            await newPending.save();
            // console.log(trader)

            // checking aggressive trades if possible
            await checkAggressive();

            return res.status(200).json({
                "title":" Transaction pending and order placed",
                "message":  `${tradedStock - qty} Stocks traded and ${qty} is in pending`,  
                // "trade":"1"
            })
        }

        // checking aggressive trades if possible
        await checkAggressive();
        
        return res.status(200).json({
            "title":" Transaction Successful",
            "message": "transaction done",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "title":" Transaction Unsuccessful",
            "message":"Server error"
        }) 
    }
})

module.exports = router;