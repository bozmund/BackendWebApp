import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {} from "dotenv/config";
import cors from "cors"; // Import cors module
import jwt from "jsonwebtoken"; // Import JWT module
import validateToken from "./middleware/validateTokenHandler.js";
import { UserModel } from "./models/mongodbmodels.js";
import { _getSpotifyToken } from "./spotifyconnector/_getSpotifyToken.js";
import { _getTidalToken } from "./tidalconnector/_getTidalToken.js";
import { convertSongSpotifyTidal } from "./functions/converter.js";

const client_credentials = {
  spotify_client_id: process.env.SPOTIFY_CLIENT_ID,
  spotify_client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  tidal_client_id: process.env.TIDAL_CLIENT_ID,
  tidal_client_secret: process.env.TIDAL_CLIENT_SECRET,
};

const port = 3001;
const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors()); // Use cors middleware
app.use("/api/v1", router); // Apply validateToken middleware to all routes under /api/v1

try {
  mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log("Could not connect to MongoDB. Add new IP to whitelist.");
}

const spotify_access_token = await _getSpotifyToken(
  client_credentials.spotify_client_id,
  client_credentials.spotify_client_secret
);
const tidal_access_token = await _getTidalToken(
  client_credentials.tidal_client_id,
  client_credentials.tidal_client_secret
);

if (!spotify_access_token || !tidal_access_token) {
  console.log("Access token not found");
  process.exit(1);
}

// Get user endpoint
app.get("/api/v1/user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if(!token) return; // Get the token from the authorization header
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
    const userId = decodedToken.user._doc._id; // Get the userId from the decoded token

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { username } = user; // Exclude password from user info
    res.json({ user: username });
  } catch (error) {
    res.json({ error: "User is not logged in."});
  }
});


// Login endpoint
app.post("/api/v1/login", async (req, res) => {
  // Logic to authenticate user credentials
  const email = req.body.email;
  const password = req.body.password;

  // Check if email is provided
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Check if password is provided
  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const user = await UserModel.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const { password, ...userInfo } = user; // Exclude password from user info
    const token = jwt.sign(
      {
        user: userInfo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    ); 
    res.status(200).json({ token, user: userInfo });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// Register endpoint
app.post("/api/v1/register", async (req, res) => {
  // Logic to register a new user
  const { username, email, password } = req.body;

  // Check if username, password, and email are provided
  if (!username || !password || !email) {
    res.status(400).json({ error: "All fields are necessary" });
    return;
  }

  // Check if the user already exists
  const user = await UserModel.findOne({ email });
  if (user) {
    res.status(400).json({ error: "User already exists" });
    return;
  }
  console.log("User does not exist");

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Password hashed");

  // Save the user to the database
  const newUser = new UserModel({
    username,
    email,
    password: hashedPassword,
  });
  console.log("New user created");

  try {
    await newUser.save();
    console.log("User saved");

    // Check if the user is successfully stored in the database
    const savedUser = await UserModel.findOne({ email });
    if (savedUser) {
      return res.status(201).json({ message: "User registered successfully" });
    } else {
      return res.status(500).json({ error: "Failed to register user" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.get(`/api/v1/convert/Song/Spotify/Tidal/:link`, validateToken, async (req, res) => {
  let conversion = await convertSongSpotifyTidal(
    req.params.link,
    spotify_access_token,
    tidal_access_token
  );
  res.send(conversion);
});

app.get(`/api/v1/convert/Song/Tidal/Spotify/:link`, validateToken, async (req, res) => {
  let conversion = await convertSongTidalSpotify(
    req.params.link,
    tidal_access_token,
    spotify_access_token
  );
  res.send(conversion);
});

app.get(`/api/v1/convert/Playlist/Spotify/Tidal/:link`, validateToken, async (req, res) => {
  let conversion = await convertPlaylistSpotifyTidal(
    req.params.link,
    spotify_access_token,
    tidal_access_token
  );
  res.send(conversion);
});

app.get(`/api/v1/convert/Playlist/Tidal/Spotify/:link`, validateToken, async (req, res) => {
  let conversion = await convertPlaylistTidalSpotify(
    req.params.link,
    tidal_access_token,
    spotify_access_token
  );
  res.send(conversion);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
