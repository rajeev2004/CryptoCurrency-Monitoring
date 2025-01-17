import pkg from 'pg';
const {Pool}=pkg;
import dotenv from 'dotenv';
dotenv.config();
const db=new Pool({
    user:process.env.PGUSER,
    host:process.env.PGHOST,
    password:process.env.PGPASSWORD,
    port:process.env.PGPORT,
    database:process.env.PGDATABASE,
    ssl:{
        rejectUnauthorized:false
    }
});
export default db;