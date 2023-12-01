import express from "express";
import {} from "dotenv/config";
import { _getToken } from "./spotifyconnector/_getToken.js";

const port = 3000;
const app = express();
const router = express.Router();
const client_credentials = {
  client_id: process.env.SPOTIFY_CLIENT_ID,
  client_secret: process.env.SPOTIFY_CLIENT_SECRET,
};
const access_token = await _getToken(
  client_credentials.client_id,
  client_credentials.client_secret
);
if (!access_token) {
  console.log("access_token not found");
  process.exit(1);
}

app.use(express.json());
app.use("/api", router);

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
