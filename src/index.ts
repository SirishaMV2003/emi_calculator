import cors from 'cors';
import express from 'express';
import { json } from 'express';
import emiRouter from './routes/emi';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', emiRouter);

app.listen(port, () => {
  // Simple startup log for visibility in dev
  console.log(`EMI API running on port ${port}`);
});
