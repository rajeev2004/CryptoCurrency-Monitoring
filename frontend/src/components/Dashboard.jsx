import React,{useState,useEffect} from "react";
import axios from "axios";
import './Dashboard.css';
import {useNavigate} from "react-router-dom";
function Dashboard(){
    const navigate=useNavigate();
    const backend='http://localhost:5000';
    const[coin,setCoin]=useState("");
    const[price,setPrice]=useState("");
    const[source,setSource]=useState("");
    const[coinName,setCoinName]=useState("");
    const[threshold,setThreshold]=useState("");
    useEffect(()=>{
        async function checkAlerts(){
            try{
                const response=await axios.get(`${backend}/api/users/checkAlerts`,{
                    headers:{
                        Authorization:`Bearer ${localStorage.getItem("token")}`
                    }
                });
                console.log("Response from checkAlerts:",response.data);
                if(response.data.alerts && response.data.alerts.length>0){
                    alert('Alerts sent successfully! check your emails');
                }else{
                    alert(response.data.message);
                }
            }catch(err){
                console.log(err.message);
            }
        }
        const interval=setInterval(checkAlerts,600000); //checking of the prices will be done every 10 minutes.
        return ()=>clearInterval(interval);
    },[])
    async function showCoinPrice(e){
        try{
            e.preventDefault();
            const value=await axios.get(`${backend}/api/users/getCoinPrice/${coin}`,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            });
            setCoin("");
            setPrice(value.data.price);
            setSource(value.data.source);
        }catch(err){
            alert('no coin found');
            console.log(err.message);
        }
    }
    async function createAlert(e){
        try{
            e.preventDefault();
            const result=await axios.get(`${backend}/api/users/createAlert/${coinName}/${threshold}`,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            })
            setCoinName("");
            setThreshold("");
            alert(result.data.message);
        }catch(err){
            console.log(err.message);
        }
    }
    async function logout(){
        localStorage.removeItem('token');
        navigate('/login');
    }
    return(
        <div className="container2">
            <div className="innerContainer">
                <div>
                    <h3>Form to get current prices</h3>
                </div>
                <form onSubmit={showCoinPrice} className="priceform">
                    <div>
                        <input type="text" placeholder="Enter Coin name" value={coin} onChange={(e)=>setCoin(e.target.value)} required />
                    </div>
                    <button type="submit">Show Current Price</button>
                </form>
                <div>
                    {price && <p>Current price is: <strong>{price}$</strong>, obtained from <strong>{source}</strong></p>}
                </div>
            </div>
            <div>
                <h3>Form for alert messages</h3>
                <form onSubmit={createAlert} className="">
                    <input type="text" placeholder="Enter coin name for an alert" value={coinName} onChange={(e)=>setCoinName(e.target.value)} required />
                    <input type="number" placeholder="Enter threshold value($)" value={threshold} onChange={(e)=>setThreshold(e.target.value)} required /> 
                    <button type="submit">Set an Alert</button>
                </form>
            </div>
            <button onClick={()=>logout()}>Logout</button>
        </div>
    )
}
export default Dashboard;