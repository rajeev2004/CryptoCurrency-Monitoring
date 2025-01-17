import Redis from "ioredis";
const redis=new Redis({
    host:'localhost',
    port:6379,
    db:0
});
redis.on('connect',()=>{
    console.log("connected to redis");
});
redis.on('error',(err)=>{
    console.log(`${err}`);
});
export default redis;