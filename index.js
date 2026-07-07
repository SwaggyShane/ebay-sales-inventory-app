import express from 'express';
import pg from 'pg';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';
import { initializeDatabase } from './db-schema.js';
import { Server } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase(pool);
  } catch (err) {
    console.error('Database initialization error:', err);
  }
})();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import salesRoutes from './routes/sales.js';
import inventoryRoutes from './routes/inventory.js';
import ebayRoutes from './routes/ebay.js';

app.use('/api/auth', authRoutes(pool));
app.use('/api/customers', customerRoutes(pool, io));
app.use('/api/sales', salesRoutes(pool, io));
app.use('/api/inventory', inventoryRoutes(pool, io));
app.use('/api/ebay', ebayRoutes(pool));

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

export { pool, io };
