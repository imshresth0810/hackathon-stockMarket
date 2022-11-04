import React, { Component, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './pages/Dashboard/Dashboard'
import Sidebar from "./pages/Sidebar/Sidebar";
import Users from "./pages/Users/Users"
import './App.css';

function App() {

  const [mode, setMode] = useState("light")

  return (
    <div className="App" style={mode==="light"? {backgroundColor: "#F0F3F8"}: {backgroundColor: "#070B28"} }>
      <Router>
        <Sidebar mode={mode} setMode={setMode}/>
        <Routes>
          <Route exact path="/" element={<Dashboard mode={mode}/>} />
          <Route exact path="/useredit" element={<Users mode={mode}/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
