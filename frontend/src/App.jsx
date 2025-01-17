import React,{useState} from 'react'
import {HashRouter as Router,Routes,Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Notfound from './components/Notfound';
function App(){
  return (
    <Router>
        <div>
            <Routes>
                <Route exact path="/" element={<Register />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/dashboard" element={<Dashboard />}/>
                <Route path="*" element={<Notfound />}/>
            </Routes>
        </div>
    </Router>
  );
}

export default App
