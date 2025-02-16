import express, { Express, Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";

const app: Express = express();
const port: number = 5000;

// Enable CORS for all routes
app.use(cors());

// Create a new pool instance
const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "auction_db",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

// Function to test database connection
async function testDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  }
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});

// Add a health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  const dbConnected = await testDbConnection();

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbConnected ? "connected" : "disconnected",
  });
});

// Test database connection before starting the server
testDbConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Handle cleanup on shutdown
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("Pool has ended");
    process.exit(0);
  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  }
});
