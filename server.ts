import express, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  // Add transport options
  transports: ['websocket', 'polling'],
});
const port: number = 5001;

// Enable CORS for all routes
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Create a new pool instance
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'auction_db',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Function to test database connection
async function testDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express!');
});

// Add a health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbConnected = await testDbConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Example: Send updates about database status
  socket.on('checkHealth', async () => {
    const dbConnected = await testDbConnection();
    socket.emit('healthUpdate', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });
});

// Update server startup to use httpServer instead of app
testDbConnection()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle cleanup on shutdown
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Pool has ended');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
});
