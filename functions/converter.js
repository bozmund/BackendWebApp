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
  const tidalSongResponseData = tidalResponse.data.resource;
  const spotifySearchParameters =
    tidalSongResponseData.artists[0].name + " " + tidalSongResponseData.title;
  const spotifyResponse = await spotifySearchSong(spotifySearchParameters, spotify_access_token);
  return spotifyResponse.data;
}

async function convertPlaylistSpotifyTidal(
  playlistId,
  spotify_access_token,
  tidal_access_token
) {
  // Logic to convert a Spotify playlist to a Tidal playlist
}

async function convertPlaylistTidalSpotify(
  playlistId,
  tidal_access_token,
  spotify_access_token
) {
  // Logic to convert a Tidal playlist to a Spotify playlist
}

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
async function spotifySearchSong(spotifySearchParameters, spotify_access_token) {
  return await axios.get("https://api.spotify.com/v1/search", {
    params: {
      q: spotifySearchParameters,
      type: "track",
      market: "US",
      limit: 10,
      offset: 0,
    },
    headers: {
      Authorization: `Bearer ${spotify_access_token}`,
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
    `https://openapi.tidal.com/tracks/${songId}?countryCode=US`,
    {
      headers: {
        'accept': "application/vnd.tidal.v1+json",
        'Authorization': "Bearer " + tidal_access_token,
        "Content-Type": "application/vnd.tidal.v1+json",
      }
    }
  );
}

  
export { convertSongSpotifyTidal, convertSongTidalSpotify, convertPlaylistSpotifyTidal, convertPlaylistTidalSpotify};

