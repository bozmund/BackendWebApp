import axios from "axios";
import SpotifySongResponse from "../models/spotifySongResponse.js";

async function convertSongSpotifyTidal(
  songId,
  spotify_access_token,
  tidal_access_token
) {
  const spotifyResponse = await spotifyGetSong(songId, spotify_access_token);
  const spotifySongResponseData = new SpotifySongResponse(spotifyResponse.data);
  const tidalSearchParameters =
    spotifySongResponseData.artists[0].name + " " + spotifySongResponseData.name;
  const tidalResponse = await tidalSearchSong(tidalSearchParameters, tidal_access_token);
  return tidalResponse.data;
}

async function convertSongTidalSpotify(
  songId,
  tidal_access_token,
  spotify_access_token
) {
  const tidalResponse = await tidalGetSong(songId, tidal_access_token);
  const tidalSongResponseData = tidalResponse.data;
  const spotifySearchParameters =
    tidalSongResponseData.artists[0].name + " " + tidalSongResponseData.title;
  const spotifyResponse = await spotifySearchSong(spotifySearchParameters, spotify_access_token);
  return spotifyResponse.data;
}
export { convertSongSpotifyTidal };
  async function tidalSearchSong(tidalSearchParameters, tidal_access_token) {
    return await axios.get("https://openapi.tidal.com/search", {
      params: {
        query: tidalSearchParameters,
        offset: 0,
        limit: 10,
        countryCode: "US",
        popularity: "WORLDWIDE",
      },
      headers: {
        'accept': "application/vnd.tidal.v1+json",
        'Authorization': "Bearer " + tidal_access_token,
        "Content-Type": "application/vnd.tidal.v1+json",
      },
    });
  }

  async function spotifyGetSong(songId, spotify_access_token) {
    return await axios.get(
      `https://api.spotify.com/v1/tracks/${songId}`,
      {
        headers: {
          Authorization: `Bearer ${spotify_access_token}`,
        },
      }
    );
  }

  async function tidalGetSong(songId, tidal_access_token) {
    return await axios.get(
      `https://api.tidal.com/v1/tracks/${songId}`,
      {
        headers: {
          Authorization: `Bearer ${tidal_access_token}`,
        },
      }
    );
  }

