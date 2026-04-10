// Load environment variables FIRST before any other imports
import './load-env';
import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import projectRoutes from './routes/projects';
import requestRoutes from './routes/requests';
import sendRoutes from './routes/send';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/send', sendRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
