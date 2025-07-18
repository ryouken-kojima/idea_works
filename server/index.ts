import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import ideasRouter from './routes/ideas.js';
import developmentsRouter from './routes/developments.js';
import chatRouter from './routes/chat.js';
import requestsRouter from './routes/requests.js';
import dashboardRouter from './routes/dashboard.js';
import developmentDetailRouter from './routes/development-detail.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/developments', developmentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/development-detail', developmentDetailRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});