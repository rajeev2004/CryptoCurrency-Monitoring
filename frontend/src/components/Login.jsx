import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
function Login(){
    const backend='http://localhost:5000';
    const navigate=useNavigate();
    const[email,setEmail]=useState("");
    const[pass,setPass]=useState("");
    const[error,setError]=useState("");
    async function userLogin(e){
        e.preventDefault();
        try{
            const result=await axios.post(`${backend}/api/users/login`,{email,pass});
            setError(result.data.message);
            if(result.data.message==="login successful"){
                navigate('/dashboard');
                localStorage.setItem('token',result.data.token);
            }
        }catch(err){
            setError('login failed');
            console.error(err.message);
        }
    }
    return(
        <div className="container">
            <form className="form" onSubmit={userLogin}>
                <div>
                    <input type="email" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div>
                    <input type="password" placeholder="Enter Password" value={pass} onChange={(e)=>setPass(e.target.value)} required />
                </div>
                <div className="buttonclass">
                    <button type="submit">Login</button>
                    <button type="button" onClick={()=>navigate('/')}>New user? Register here...</button>
                </div>
            </form>
            <div>
                {error && <p className="message">{error}</p>}
            </div>
        </div>
    )
}
export default Login;