import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import 'colors';
import { globalErrorHandler } from './utils/globalErrorHandler';
// Routes
import { userRoutes } from './routes/user';
import { codePostRoutes } from './routes/codePost';
import { reviewRoutes } from './routes/review';

const app = express();

// load env variables
dotenv.config();

// see mongoose queies in log
mongoose.set('debug', true);

// connect to mongodb
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDB Connected'.green.bold);
    })
    .catch(err => {
        console.log(`${err}`.red);
    });

// parse application/json
app.use(express.json());

// routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/code-post', codePostRoutes);
app.use('/api/v1/review', reviewRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
