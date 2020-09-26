import express from 'express';
import dotenv from 'dotenv';
import 'colors';

const app = express();

// load env variables
dotenv.config();

console.log('YOUR ENV VAR', process.env.YOUR_VARIABLE);

// parse application/json
app.use(express.json());

export default app;
