import express from "express";
import mongoose from "mongoose";
import {} from "dotenv/config";
import { _getSpotifyToken } from "./spotifyconnector/_getSpotifyToken.js";
import { _getTidalToken } from "./tidalconnector/_getTidalToken.js";

const client_credentials = {
  spotify_client_id: process.env.SPOTIFY_CLIENT_ID,
  spotify_client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  tidal_client_id: process.env.TIDAL_CLIENT_ID,
  tidal_client_secret: process.env.TIDAL_CLIENT_SECRET,
};

const port = 3000;
const app = express();
const router = express.Router();

app.use(express.json());
app.use("/api", router);

mongoose.connect(process.env.MONGODB_URI);

const spotify_access_token = await _getSpotifyToken(
  client_credentials.spotify_client_id,
  client_credentials.spotify_client_secret
);
const tidal_access_token = await _getTidalToken(
  client_credentials.tidal_client_id,
  client_credentials.tidal_client_secret
);

if (!spotify_access_token || !tidal_access_token) {
  console.log("access_token not found");
  process.exit(1);
}

//app.route("/").get(async (req, res) => {
//  const response = await _getToken(
//    client_credentials.client_id,
//    client_credentials.client_secret
//  );
//  res.send(response);
//});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
