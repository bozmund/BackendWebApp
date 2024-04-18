import axios from "axios";
import SpotifySongResponse from "../models/spotifySongResponse.js";
import { urlencoded } from "express";

const folderId = "b8b4224e-8569-4079-a7a6-7f0d6151fd66";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function convertSongSpotifyTidal(
  songId,
  spotify_access_token,
  tidal_access_token
) {
  const spotifyResponse = await _spotifyGetSong(songId, spotify_access_token);
  const spotifySongResponseData = new SpotifySongResponse(spotifyResponse.data);
  const tidalSearchParameters = encodeURIComponent(spotifySongResponseData.name + " " + spotifySongResponseData.artists[0].name);
  const tidalResponse = await _tidalSearchSong(tidalSearchParameters, tidal_access_token, spotifySongResponseData.album.available_markets);
  return tidalResponse.data;
}
async function convertSongTidalSpotify(
  songId,
  tidal_access_token,
  spotify_access_token
) {
  const tidalResponse = await _tidalGetSong(songId, tidal_access_token);
  const tidalSongResponseData = tidalResponse.data.resource;
  const spotifySearchParameters =
  tidalSongResponseData.title + " " + tidalSongResponseData.artists[0].name;
  const spotifyResponse = await _spotifySearchSong(spotifySearchParameters, spotify_access_token);
  return spotifyResponse.data;
}

async function convertPlaylistSpotifyTidal(
  playlistId,
  spotify_access_token,
  tidal_access_token
) {
  let TidalSongIdList = [];
  const spotifyResponse = await _spotifyGetPlaylist(playlistId, spotify_access_token);
  let spotifyPlaylistResponseData = spotifyResponse.data;
  let spotifyPlaylistTracks = spotifyPlaylistResponseData.tracks.items.map((track) => track.track);
  spotifyPlaylistTracks = spotifyPlaylistTracks.map((track) => {
    return {
      id: track.id,
    };
  });
  for (let track of spotifyPlaylistTracks) {
    let tidalTrack = await convertSongSpotifyTidal(track.id, spotify_access_token, tidal_access_token);
    if (tidalTrack.tracks.length > 0) {
      TidalSongIdList.push(tidalTrack.tracks[0].id);
    }
    await delay(1000);
}
  const tidalPlaylist = await _tidalMakePlaylist(tidal_access_token, spotifyPlaylistResponseData.description, spotifyPlaylistResponseData.name);
  const tidalPlaylistId = tidalPlaylist.data.uuid;
  let response = await _tidalAddSongToPlaylist(tidal_access_token, tidalPlaylistId, TidalSongIdList);
  if (response.status === 200) {
    return tidalPlaylist;
  }
}

async function _tidalSearchSong(tidalSearchParameters, tidal_access_token, countryCode = "HR") {
  return await axios.get("https://openapi.tidal.com/search", {
    params: {
      query: tidalSearchParameters,
      offset: 0,
      limit: 1,
      countryCode: countryCode,
      popularity: "WORLDWIDE",
    },
    headers: {
      'accept': "application/vnd.tidal.v1+json",
      'Authorization': "Bearer " + tidal_access_token,
      "Content-Type": "application/vnd.tidal.v1+json",
    },
  });
}
async function _spotifySearchSong(spotifySearchParameters, spotify_access_token) {
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
async function _spotifyGetSong(songId, spotify_access_token) {
  return await axios.get(
    `https://api.spotify.com/v1/tracks/${songId}`,
    {
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
      },
    }
  );
}
async function _tidalGetSong(songId, tidal_access_token) {
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
async function _spotifyGetPlaylist(playlistId, spotify_access_token) {
  return await axios.get(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
      },
    }
  );
}
async function _tidalMakePlaylist(tidal_access_token, description, name) {
  const q = {
    description: description,
    folderId: folderId,
    isPublic: true,
    name: name,
    countryCode: "HR",
    locale: "hr_HR",
    deviceType: "BROWSER"
  };

  const params = new URLSearchParams({
    description: q.description,
    folderId: q.folderId,
    isPublic: q.isPublic,
    name: q.name,
    countryCode: q.countryCode,
    locale: q.locale,
    deviceType: q.deviceType
  });

  const url = `https://listen.tidal.com/v2/my-collection/playlists/folders/create-playlist?${params.toString()}`;

  const headers = {
    "accept": "application/json",
    "authorization": "Bearer " + tidal_access_token,
    "content-type": "application/json"
  };

  return await axios.put(url, null, { headers });
}
async function _tidalAddSongToPlaylist(tidal_access_token, playlistId, songId) {
  const url = `https://listen.tidal.com/v1/playlists/${playlistId}/tracks/items`;
  const body = `onArtifactNotFound=FAIL&onDupes=FAIL&trackIds=${songId}`;

  const headers = {
    "accept": "application/json",
    "authorization": "Bearer " + tidal_access_token,
    "content-type": "application/json"
  };

  return await axios.post(url, body, { headers });
}
export { convertSongSpotifyTidal, convertSongTidalSpotify, convertPlaylistSpotifyTidal};

