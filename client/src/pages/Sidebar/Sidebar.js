import React from 'react'
import { useNavigate } from 'react-router-dom';
import classes from './Sidebar.module.css'
import icon from '../../images/k.webp'
import { AiOutlineUserSwitch } from "react-icons/ai";
import { GiTrade } from "react-icons/gi";
import { BsFillSunFill, BsFillMoonFill} from "react-icons/bs";

function Sidebar(props) {
  const navigate = useNavigate();
  return (
    <div className = {props.mode==="light" ? classes.sidebar : `${classes.sidebar} ${classes.carddark}`}>
        <div className={classes.logo}><img height="100%" width="100%" src={icon} alt="description of phuto"/></div>
        <div className={classes.mid}>
            <GiTrade className={classes.icon} onClick={()=>{navigate("/")}}/>
            <AiOutlineUserSwitch className={classes.icon}  onClick={()=>{navigate("/useredit")}}/>
            {props.mode==="light" ? <BsFillSunFill onClick={() => props.setMode(props.mode==="light"? "dark" : "light")} className={classes.icon}/>: <BsFillMoonFill onClick={() => props.setMode(props.mode==="light"? "dark" : "light")} className={classes.icon}/>}
        </div>
    </div>
  )
}

export default Sidebar