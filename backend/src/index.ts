import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkRoutes from './routes/link.routes';
import { redirectUrl } from './controllers/link.controller';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('BoltLink Backend Running');
});
app.use('/api', linkRoutes);
app.get('/:code', redirectUrl);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
