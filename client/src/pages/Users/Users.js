import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import classes from "./Users.module.css";
import Api from "../Api/Api";

const Users = () => {
  const [username, setUsername] = useState("");
  const [stocks, setStocks] = useState(0);
  const [fiat, setFiat] = useState(0);

  const ck= async()=>{
    try{
      const res = Api.delete("/user/delete");
    }catch(e){
      console.log(e)
    }
  }

  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch("https://hackanintern.herokuapp.com/User/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "POST",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          stocks: stocks,
          fiat: fiat,
        }),
      });
      let resJson = await res.json();
      console.log(resJson);

      if (resJson.message === "User created") {
        setTimeout(() => {
          toast.success("User Added successfully", {
            position: "top-center",
          });
        }, 100);
      } else {
        toast.warn("Invalid Credentials", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className={classes.Dashboard}>
        <div className={classes.c1}>
          <div className={classes.c2}>
            <div className={classes.styletext}>Add a New User</div>
            <form method="POST" onSubmit={handleSubmit} className="container">
              <Stack
                spacing={3}
                style={{
                  color: "black",
                  backgroundColor: "rgb(246 240 248 / 80%)",
                  borderRadius: "12px",
                  // border: "3px solid #6a3406",
                  backdropFilter: "blur(6px) saturate(180%)",
                  padding: "10px 10px",
                }}
              >
                <TextField
                  sx={{ input: { color: "black" }, label: { color: "black" } }}
                  fullWidth
                  placeholder="User Name"
                  type="text"
                  id="username"
                  value={username}
                  aria-describedby="emailHelp"
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ color: "#fff" }}
                />

                <TextField
                  sx={{ input: { color: "black" }, label: { color: "black" } }}
                  fullWidth
                  label="Stocks"
                  type="number"
                  id="stocks"
                  value={stocks}
                  aria-describedby="emailHelp"
                  onChange={(e) => setStocks(e.target.value)}
                  style={{ color: "#fff" }}
                />

                <TextField
                  sx={{ input: { color: "black" }, label: { color: "black" } }}
                  fullWidth
                  label="Fiat"
                  type="number"
                  id="fiat"
                  value={fiat}
                  aria-describedby="emailHelp"
                  onChange={(e) => setFiat(e.target.value)}
                  style={{ color: "#fff" }}
                />

                <LoadingButton
                  fullWidth
                  className="container"
                  size="small"
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: "#ac56d1cc" }}
                >
                  Add User...
                </LoadingButton>
                <LoadingButton
                  fullWidth
                  className="container"
                  size="small"
                  variant="contained"
                  style={{ backgroundColor: "#4164DF" }}
                  onClick={()=>ck()}
                >
                  Reset Database
                </LoadingButton>
              </Stack>
              <ToastContainer />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;