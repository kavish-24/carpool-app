const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Use Render's PORT or fallback to 3001 for local

app.use(cors());
app.use(express.json());

const connectionString = process.env.MONGODB_URI;
const databaseName = 'carpoolingDB';

let db;

// Create HTTP server for Express and WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('WebSocket client connected');
  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'rideBooked') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });
  ws.on('error', err => {
    console.error('WebSocket client error:', err);
  });
});

async function startServer() {
  try {
    const client = await MongoClient.connect(connectionString, { useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    db = client.db(databaseName);

    // Register endpoint
    app.post('/api/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, email, password: hashedPassword };
        const result = await db.collection('users').insertOne(user);
        res.status(201).json({ message: 'User registered', userId: result.insertedId });
      } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Registration failed' });
      }
    });

    // Login endpoint
    app.post('/api/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
          const sessionId = Date.now().toString();
          await db.collection('sessions').insertOne({
            sessionId,
            user: { id: user._id.toString(), name: user.name, email: user.email },
            createdAt: new Date()
          });
          res.json({ sessionId, user: { id: user._id.toString(), name: user.name, email: user.email } });
        } else {
          res.status(401).json({ error: 'Invalid credentials' });
        }
      } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Login failed' });
      }
    });

    // Middleware to verify session
    const verifySession = async (req, res, next) => {
      const sessionId = req.headers['authorization']?.split(' ')[1];
      if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const session = await db.collection('sessions').findOne({ sessionId });
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const sessionAge = (new Date() - new Date(session.createdAt)) / (1000 * 60 * 60);
      if (sessionAge > 1) {
        await db.collection('sessions').deleteOne({ sessionId });
        return res.status(401).json({ error: 'Session expired' });
      }
      req.user = session.user;
      next();
    };

    // Logout endpoint
    app.post('/api/logout', async (req, res) => {
      const sessionId = req.headers['authorization']?.split(' ')[1];
      if (sessionId) {
        await db.collection('sessions').deleteOne({ sessionId });
        res.json({ message: 'Logged out successfully' });
      } else {
        res.status(400).json({ error: 'Invalid session' });
      }
    });

    // Rides endpoints
    app.get('/api/rides', async (req, res) => {
      try {
        const bookedById = req.query.bookedById;
        const createdById = req.query.createdById;
        let query = {};
        if (bookedById) {
          query = { 'bookedBy.id': bookedById };
        } else if (createdById) {
          query = { driverId: createdById };
        } else {
          query = { status: 'available' };
        }
        const rides = await db.collection('rides').find(query).toArray();
        res.json(rides);
      } catch (err) {
        console.error('Error fetching rides:', err);
        res.status(500).json({ error: 'Failed to fetch rides' });
      }
    });

    app.post('/api/rides', verifySession, async (req, res) => {
      try {
        const { startQuery, destinationQuery, seatCapacity, vehicleNumber, fare, timings } = req.body;
        const newRide = {
          driver: req.user.name,
          driverId: req.user.id,
          startQuery,
          destinationQuery,
          seatCapacity,
          vehicleNumber,
          fare,
          timings,
          status: 'available',
          bookedBy: null
        };
        const result = await db.collection('rides').insertOne(newRide);
        res.json(result);
      } catch (err) {
        console.error('Error creating ride:', err);
        res.status(500).json({ error: 'Failed to create ride' });
      }
    });

    app.put('/api/rides/:id', verifySession, async (req, res) => {
      try {
        const { id } = req.params;
        const { startQuery, destinationQuery, seatCapacity, vehicleNumber, fare, timings } = req.body;
        const ride = await db.collection('rides').findOne({ _id: new ObjectId(id) });
        if (!ride) {
          return res.status(404).json({ error: 'Ride not found' });
        }
        if (ride.driverId !== req.user.id) {
          return res.status(403).json({ error: 'You can only edit your own rides' });
        }
        const updatedRide = {
          startQuery,
          destinationQuery,
          seatCapacity,
          vehicleNumber,
          fare,
          timings
        };
        const result = await db.collection('rides').updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedRide }
        );
        res.json(result);
      } catch (err) {
        console.error('Error updating ride:', err);
        res.status(500).json({ error: 'Failed to update ride' });
      }
    });

    app.delete('/api/rides/:id', verifySession, async (req, res) => {
      try {
        const { id } = req.params;
        const ride = await db.collection('rides').findOne({ _id: new ObjectId(id) });
        if (!ride) {
          return res.status(404).json({ error: 'Ride not found' });
        }
        if (ride.driverId !== req.user.id) {
          return res.status(403).json({ error: 'You can only delete your own rides' });
        }
        await db.collection('rides').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Ride deleted successfully' });
      } catch (err) {
        console.error('Error deleting ride:', err);
        res.status(500).json({ error: 'Failed to delete ride' });
      }
    });

    app.put('/api/rides/:id/book', verifySession, async (req, res) => {
      try {
        const { id } = req.params;
        const user = req.user;
        const result = await db.collection('rides').updateOne(
          { _id: new ObjectId(id), status: 'available' },
          { $set: { status: 'booked', bookedBy: { id: user.id, name: user.name, email: user.email } } }
        );
        if (result.matchedCount > 0) {
          const ride = await db.collection('rides').findOne({ _id: new ObjectId(id) });
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'rideBooked',
                rideId: id,
                user: { name: user.name, email: user.email },
                driverId: ride.driverId
              }));
            }
          });
          res.json(ride);
        } else {
          res.status(404).json({ error: 'Ride not available' });
        }
      } catch (err) {
        console.error('Error booking ride:', err);
        res.status(500).json({ error: 'Failed to book ride' });
      }
    });

    app.get('/api/rides/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const ride = await db.collection('rides').findOne({ _id: new ObjectId(id) });
        if (!ride) {
          return res.status(404).json({ error: 'Ride not found' });
        }
        res.json(ride);
      } catch (err) {
        console.error('Error fetching ride:', err);
        res.status(500).json({ error: 'Failed to fetch ride' });
      }
    });

    app.get('/', (req, res) => {
      res.send('Hello! This is the carpooling backend.');
    });

    // Start the combined HTTP and WebSocket server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();
