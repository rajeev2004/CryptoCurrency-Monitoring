import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
function Register(){
    const backend='http://localhost:5000';
    const navigate=useNavigate();
    const[email,setEmail]=useState("");
    const[username,setName]=useState("");
    const[pass,setPass]=useState("");
    const[error,setError]=useState("");
    async function userRegister(e){
        e.preventDefault();
        try{
            const result=await axios.post(`${backend}/api/users/register`,{username,email,pass});
            setError(result.data.message);
            if(result.data.message==="user registered"){
                navigate('/dashboard');
                localStorage.setItem('token',result.data.token);
            }else{
                alert('Try again');
            }
        }catch(err){
            setError('registration failed');
        }
    }
    return(
        <div className="container">
            <form className="form" onSubmit={userRegister}>
                <div>
                    <div>
                        <input type="text" placeholder="Enter Username" value={username} onChange={(e)=>setName(e.target.value)} required />
                    </div>
                    <div>
                        <input type="email" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <input type="password" placeholder="Enter Password" value={pass} onChange={(e)=>setPass(e.target.value)} required />
                    </div>
                </div>
                <div className="buttonclass">
                    <button type="submit">Register</button>
                    <button type="button" onClick={()=>navigate('/login')}>Already have an account?</button>
                </div>
            </form>
            <div>
                {error && <p className="message">{error}</p>}
            </div>
        </div>
    )
}
export default Register;