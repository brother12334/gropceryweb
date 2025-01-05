const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize app and middleware
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  contacts: [String],
  coins: { type: Number, default: 50 },
});

const User = mongoose.model('User', userSchema);

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle location updates
  socket.on('location', (data) => {
    console.log('Location update:', data);
    io.emit('location-update', data); // Notify all connected clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Routes
// Home route
app.get('/', (req, res) => {
  res.send('Friend Favor API is running!');
});

// Request a favor
app.post('/favors/request', async (req, res) => {
  try {
    const { requester, item } = req.body;
    const user = await User.findOne({ phoneNumber: requester });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.coins >= 10) {
      user.coins -= 10;
      await user.save();
      res.status(200).json({ message: `Favor requested for ${item}. Remaining coins: ${user.coins}` });
    } else {
      res.status(400).json({ message: 'Not enough coins' });
    }
  } catch (err) {
    console.error('Error requesting favor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a user
app.post('/users/register', async (req, res) => {
  try {
    const { phoneNumber, contacts } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ message: 'User already registered' });

    const newUser = new User({ phoneNumber, contacts });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch user data
app.get('/users/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Server setup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
