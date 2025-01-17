import db from '../config/db.js';
import axios from 'axios';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redis from '../config/redis.js';
import nodemailer from "nodemailer";
const gecko_api='https://api.coingecko.com/api/v3/simple/price';
const key=process.env.KEY;
export async function register(req,res){
    try{
        const{username,email,pass}=req.body;
        const response=await db.query('select * from users where email=$1',[email]);
        if(response.rows.length>0){
            return res.status(404).json({message:'user already exist with this username'});
        }
        const hashedPass=await bcrypt.hash(pass,10);
        const result=await db.query('insert into users (username,email,pass) values($1,$2,$3) RETURNING *',[username,email,hashedPass]);
        const token=jwt.sign({userId:result.rows[0].user_id},key,{expiresIn:'1h'});
        res.status(201).json({token,message:'user registered'});
    }catch(err){
        console.error('error in registering the user',err);
        res.status(500).json({error:'user cannot be registered'});
    }
}
export async function login(req,res){
    try{
        const{email,pass}=req.body;
        const result=await db.query('select * from users where email=$1',[email]);
        if(result.rows.length===0){
            return res.status(404).json({message:'user not found'});
        }
        const isPasswordCorrect=await bcrypt.compare(pass,result.rows[0].pass);
        if(!isPasswordCorrect){
            return res.status(400).json({message:'invalid email or password'});
        }
        const token=jwt.sign({userId:result.rows[0].user_id},key,{expiresIn:'1h'});
        res.status(200).json({token,message:'login successful'});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function getCoinPrice(req,res){
    const{coin_id}=req.params;
    try{
        const cachePrice=await redis.get(`${coin_id}`);
        if(cachePrice){
            return res.json({coin_id,price:cachePrice,source:'redis-cache'});
        }
        const result=await axios.get(`${gecko_api}?ids=${coin_id}&vs_currencies=usd`);
        console.log('Fetching price for:', coin_id);
        const price=result.data[coin_id].usd;
        if(price){
            await redis.setex(`${coin_id}`,60,price);
            return res.json({coin_id,price,source:'api'});
        }else{
            return res.status(404).json({message:'coin not found'});
        }
    }catch(err){
        console.error('error fetching the price',err);
        res.status(500).json({message:'server error'});
    }
}
const transport=nodemailer.createTransport({  // service used for mailing is gmail
    service:'gmail',
    auth:{
        user:process.env.Mail,
        pass:process.env.PASS,
    }
});
async function sendMail(to,subject,text){    // mail will be sent from: rajeevchoudhary2425@gmail.com
    try{
        await transport.sendMail({
            from:process.env.MAIL,
            to,
            subject,
            text,
        });
        console.log('email sent');
    }catch(err){
        console.log('error in sending mail');
    }
}
export async function createAlert(req,res){
    const{coin_id,threshold}=req.params;
    const userId=req.user.userId;
    if(!userId || !coin_id || !threshold){
        return res.status(404).json({error:'missing fields'});
    }
    try{
        const response=await db.query('insert into alerts (user_id,coin_id,threshold) values($1,$2,$3) RETURNING *',[userId,coin_id,threshold]);
        if(response.rows.length>0){
            return res.status(201).json({message:'alert created successfully'});
        }
    }catch(err){
        console.log('error creating the log',err);
        res.status(500).json({error:'error creating alert'});
    }
}
export async function checkAlerts(req,res){
    try{
        const result=await db.query('select * from alerts');
        if(result.rows.length===0){
            return res.status(200).json({message:'no alerts present at the moment'});
        }
        const alerts=result.rows;
        const notify=[];
        for(const alert of alerts){
            const{user_id,coin_id,threshold}=alert;
            const price=await getPrice(coin_id);
            if(price && price>=threshold){
                const user=await db.query('select email from users where user_id=$1',[user_id]);
                if(user.rows.length>0){
                    const email=user.rows[0].email;
                    const message=`the price of coin ${coin_id} has reached ${price}$ crossing your ${threshold}$`;
                    await sendMail(email,'crypto alert',message);
                }
                notify.push({userId:user_id,coinId:coin_id,price,threshold});
                await db.query('delete from alerts where user_id=$1 AND coin_id=$2',[user_id,coin_id]);
            }
        }
        if(notify.length>0){
            return res.status(200).json({alerts:notify,message:'alert send'});
        }else{
            return res.status(200).json({message:'no alerts triggered'});
        }
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:'error in sending alerts'});
    }
}
async function getPrice(coin_id){
    try{
        const result=await axios.get(`${gecko_api}?ids=${coin_id}&vs_currencies=usd`);
        return result.data[coin_id].usd;
    }catch(err){
        console.log('error during fetching the price',err);
        return null;
    }
}