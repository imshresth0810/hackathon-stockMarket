import React, { Component, useState, useEffect } from "react";
import { GrTransaction, } from "react-icons/gr";
import { BsArrowDownRight } from "react-icons/bs";
import classes from './Dashboard.module.css'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { circularProgressClasses } from "@mui/material";
import Graph from "../Graph/Graph";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Api from "../Api/Api";
import ReactLoading from 'react-loading';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

function Dashboard(props) {

    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [text, setText] = useState("");
    const [title, setTitle] = useState("")
    const [avg, setAvg] = useState(0);

    const [userlist, setUserlist] = useState([])
    const fetchUsers = async () => {
        try {
            const res = await Api.get("/transDetails/userlist");
            if (res.status === 200) {
                const data = await res.data;
                if (data.users?.length > 0)
                    setUserlist([...data.users]);
            }
        } catch (e) {
            console.log(e)
        }
    }

    const [activity, setActivity] = useState([]);
    const fetchActivity = async () => {
        try {
            const res = await Api.get("/transDetails/transactions");
            if (res.status === 200) {
                const data = await res.data;
                if (data.transactions?.length > 0)
                    setActivity([...data.transactions]);
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    const [xdata, setXdata] = useState([]);
    const [ydata, setYdata] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchXdata = async () => {
        try {
            const res = await Api.get("/transDetails/pricegraph");
            if (res.status === 200) {
                const data = await res.data;
                let xalldata = [];
                let yalldata = [];
                if (data.prices?.length > 0){
                    data.prices.forEach(element => {
                        yalldata.push(element.price)
                        xalldata.push(new Date(element.date)?.toLocaleDateString());
                    });
                }
                xalldata.reverse();
                yalldata.reverse();
                setXdata([...xalldata]);
                setYdata([...yalldata]);
                var sum = 0;
                yalldata.forEach(function(num) { sum += num });
                setAvg(yalldata ? (yalldata[yalldata.length-1]-(sum/yalldata.length))*100/(sum/yalldata.length) : 0)
                // setGraphcomp(<Graph xdata = {xalldata} ydata={yalldata}/>)
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    const [buy, setBuy] = useState([]);
    const [sell, setSell] = useState([])
    const fetchOrders = async () => {
        try {
            const res = await Api.get("/transDetails/pending");
            if (res.status === 200) {

                const data = await res.data;
                //     // data.buy.forEach(element => {
                    //     //     // if()
                    //     // });
                    // }
                if (data.buy?.length >= 0)
                    setBuy([...data.buy]);
                if (data.sell?.length >= 0)
                    setSell([...data.sell]);
            }
        } catch (e) {
            console.log(e)
        }
    }

    const [username, setUsername] = React.useState('');
    const [order, setOrder] = React.useState('');
    const [trade, setTrade] = React.useState('');
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('')
    const [sellStock, setSellstock] = useState('')
    const [worth, setWorth] = useState('')

    const handleChange = (event) => {
        setUsername(event.target.value);
        if(userlist){ 
            var user = userlist.find(({ username }) => username === event.target.value)
            setSellstock(user?.stocks);
            setWorth(user?.fiat)
            console.log(user)
        }
    };
    const handleChange1 = (event) => {
        setOrder(event.target.value);
    };
    const handleChange2 = (event) => {
        setTrade(event.target.value);
    };

    const submitter = async()=>{
        // console.log("=======")
        // console.log(username, order, trade, qty, price);
        if((qty!='' && (qty<=0 || (trade==="sell" && qty>sellStock))) || (order!=="market" && price!='' && (price<=0 || (trade==="buy" && price*qty>worth))) || !qty || !username || !trade || !order) return;
        try{
            setLoading(true);
            const res = await Api.post(`/transaction/${order}`,{
                trade, username, qty, price
            })
            if(res.status === 200){
                const data = await res.data;
                const msg = data.message;
                const titl = data.title;
                await fetchUsers();
                await fetchActivity();
                await fetchXdata();
                await fetchOrders();
                setText(msg);
                setTitle(titl);
                setOpen2(true);
                setLoading(false);
            }
        }catch(e){
            console.log(e);
            setText(e.response)
            setTitle("Transaction UnSuccessful");
            setOpen(true);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchActivity();
        fetchXdata();
        fetchOrders();
    }, [])

    return (
        <>{
            loading === true?
            <div className={classes.load}>
            <ReactLoading type="balls" color="black" height={667} width={375} />
            </div>
            :
            <>
            <Modal
                open={open}
                onClose={()=>setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {title}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Error: {text}
                    </Typography>
                </Box>
            </Modal>
            <Modal
                open={open2}
                onClose={()=>setOpen2(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {title}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Message: {text}
                    </Typography>
                </Box>
            </Modal>
            <div className={props.mode==="light"? classes.Dashboard : `${classes.Dashboard} ${classes.DashDark}`} >
                <div className={classes.c1}>
                    <div className={props.mode==="light"? classes.c2 : `${classes.c2} ${classes.carddark}`}>
                        <div className={props.mode==="light"? classes.styletext : `${classes.styletext} ${classes.txtdark}`}>User Portfolio</div>
                        <div className={classes.card1}>
                            <div className={classes.subcard}>
                                <div className={classes.s11}>UserName</div>
                                <div className={classes.s11}>Stocks</div>
                                <div className={classes.s11}>Fiat $</div>
                            </div>
                            <div className={classes.sc}>
                                {userlist && userlist.map((e, index) => {
                                    return (
                                        <div className={classes.subcard} key={index}>
                                            <div className={classes.s1}>{e.username}</div>
                                            <div className={classes.s1}>{e.stocks}</div>
                                            <div className={classes.s1}>{e.fiat}</div>
                                        </div>
                                    )
                                })}

                            </div>
                        </div>
                    </div>
                    <div className={props.mode==="light"? classes.c2 : `${classes.c2} ${classes.carddark}`}>
                        <div className={props.mode==="light"? classes.styletext : `${classes.styletext} ${classes.txtdark}`}>Trade Transactions</div>
                        <div className={classes.card1}>
                            <div className={`${classes.sc} ${classes.sc1}`}>
                                {activity && activity.map((e, index) => {
                                    return (
                                        <div className={index%2===0? classes.subcardxx : props.mode==="light"? `${classes.subcardxx} ${classes.cardcolor}` : `${classes.subcardxx} ${classes.cardcolordark}`} key={index}>
                                            <div className={classes.s2}>
                                                <div style={{ fontWeight: '600', fontSize: 'large', marginTop: "0.2rem" }}>{e.Suser?.length>6? e.Suser.slice(0,6)+"..": e.Suser }</div>
                                                <div style={{ fontWeight: '300', fontSize: 'small', color: "red" }}>Sold</div>
                                            </div>
                                            <div className={classes.icon}><GrTransaction /></div>
                                            <div className={classes.s2}>
                                                <div style={{ fontWeight: '600', fontSize: 'large', marginTop: "0.2rem" }}>{e.Buser?.length>6? e.Buser.slice(0,6)+"..": e.Buser}</div>
                                                <div style={{ fontWeight: '300', fontSize: 'small', color: 'lightgreen' }}>Bought</div>
                                            </div>
                                            <div className={classes.s2} style={{width: "7rem", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                                                <div style={{ fontWeight: '600', fontSize: 'large', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",textAlign: "left",width: "7rem"}}><abbr title={`${e.qty} at ${e.price}`}>{e.qty} at &#36;{e.price}</abbr> </div>
                                                <div style={{ fontWeight: '300', fontSize: 'small', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", textAlign: "left",width: "7rem" }}>{e.date? new Date(e.date).toLocaleDateString():""}</div>
                                                <div style={{ fontWeight: '300', fontSize: 'small', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", textAlign: "left",width: "7rem" }}>{e.date? new Date(e.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }):""}</div>
                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                        </div>
                    </div>
                </div>
                <div className={classes.c1}>
                    <div className={props.mode==="light"? classes.c3 : `${classes.c3} ${classes.carddark}`}>

                        <div className={classes.header}>
                            <div className={classes.s2}>
                                <div style={{ fontWeight: '650', fontSize: 'large' }} className = {props.mode==="light"? "" : `${classes.txtdark}`}>Current Market Price</div>
                                <div style={avg>=0 ? { fontWeight: '300', fontSize: 'small', color: 'lightgreen', borderRadius: '2rem' } : { fontWeight: '300', fontSize: 'small', color: 'red', borderRadius: '2rem' }}>Change</div>
                            </div>
                            <div className={classes.s2}>
                                <div style={{ fontWeight: '600', fontSize: 'x-large' }} className = {props.mode==="light"? "" : `${classes.txtdark}`}>{ydata? "$ " + ydata.slice(-1) : "$ ..."}</div>
                                <div style={avg>=0 ? { fontWeight: '300', fontSize: 'small', color: 'lightgreen', borderRadius: '2rem' } : { fontWeight: '300', fontSize: 'small', color: 'red', borderRadius: '2rem' }}>{avg.toFixed(3)}%</div>
                            </div>
                        </div>

                        {/* Graph */}

                        {/* ------------------------------- */}
                        <Graph xdata = {xdata} ydata={ydata}/>


                    </div>
                    <div className={props.mode==="light"? classes.buysell : `${classes.buysell} ${classes.carddark}`}>
                        <div className={classes.col}>
                            <div style={{ fontSize: "x-large", color: "green", marginBottom: "0.5rem" }}>BUY</div>
                            <div className={classes.col1}>
                                <div className={classes.unit}>
                                    <div style={{ fontWeight: '600' }}>Quantity</div>
                                    <div style={{ fontWeight: '600' }}>Price</div>
                                </div>
                                <div className={classes.edit}>
                                    {buy.map((e, index) => {
                                        if(e.price !== -1)
                                        return (
                                            <div className={classes.unit} style={{ borderBottom: "1px solid green" }} key={index}>
                                                <div>{e.qty}</div>
                                                <div>{e.price}</div>
                                            </div>
                                        )
                                        if(e.price == -1)
                                        return (
                                            <div className={classes.unit} style={{ borderBottom: "1px solid green" }} key={index}>
                                                <div>{e.qty}</div>
                                                <div>At any price</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className={classes.col}>
                            <div style={{ fontSize: "x-large", color: "red", marginBottom: "0.5rem" }}>SELL</div>
                            <div className={classes.col1}>
                                <div className={classes.unit}>
                                    <div style={{ fontWeight: '600' }}>Quantity</div>
                                    <div style={{ fontWeight: '600' }}>Price</div>
                                </div>
                                <div className={classes.edit}>
                                    {sell.map((e, index) => {
                                        if(e.price !== -1)
                                        return (
                                            <div className={classes.unit} style={{ borderBottom: "1px solid red" }} key={index}>
                                                <div>{e.qty}</div>
                                                <div>{e.price}</div>
                                            </div>
                                        )
                                        if(e.price == -1)
                                        return (
                                            <div className={classes.unit} style={{ borderBottom: "1px solid red" }} key={index}>
                                                <div>{e.qty}</div>
                                                <div>At any price</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className={classes.c1}>

                    <div className={props.mode==="light"? classes.c4 : `${classes.c4} ${classes.carddark}`}>
                        <div className={props.mode==="light"? classes.styletext : `${classes.styletext} ${classes.txtdark}`}>Transaction</div>
                        <div style={{ marginTop: "2rem" }}>
                            <Box sx={{ minWidth: 340 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Username</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={username}
                                        label="Select User"
                                        onChange={handleChange}
                                    >
                                        {userlist && userlist.map((e, i)=>{
                                            return(
                                                <MenuItem value={e.username} key={i}>{e.username}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div style={{ marginTop: "2rem" }} >
                            <Box sx={{ minWidth: 340 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Order Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={order}
                                        label="Order Type"
                                        onChange={handleChange1}
                                        
                                    >
                                        <MenuItem value={"market"}>Market</MenuItem>
                                        <MenuItem value={"limit"}>Limit</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div style={{ marginTop: "2rem" }}>
                            <Box sx={{ minWidth: 340 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Buy / Sell</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={trade}
                                        label="Order Type"
                                        onChange={handleChange2}
                                    >
                                        <MenuItem value={"buy"}>Buy</MenuItem>
                                        <MenuItem value={"sell"}>Sell</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className={classes.opt}>
                            <input className={props.mode==="light"? "" : classes.inp} value={qty} onChange={(e)=>setQty(e.target.value)} placeholder="Select Quantity" type="number"></input>
                            {(qty!='' && (qty<=0 || (trade==="sell" && qty>sellStock))) ? <div className={classes.war}>You don't have enough stock or invalid input</div> : ""}
                            {order!=="market"? <input type="number" className={props.mode==="light"? "" : classes.inp} value={price} onChange={(e)=>setPrice(e.target.value)}  placeholder="Price" min="1" max = {trade==="buy"? worth: Infinity}></input> : ""}
                            {(order!=="market" && price!='' && (price<=0 || (trade==="buy" && price*qty>worth))) ? <div className={classes.war}>You don't have enough balance or invalid input</div> : ""}
                        </div>

                        <div className={classes.button} onClick={()=>submitter()}>Place Order</div>
                    </div>
                </div>

            </div>
            </>}
        </>
    )
}

export default Dashboard