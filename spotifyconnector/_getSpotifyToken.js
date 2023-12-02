async function _getSpotifyToken(spotifyClientID, spotifyClientSecret) {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + btoa(spotifyClientID + ":" + spotifyClientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  const access_token = data.access_token;
  return access_token;
}

export { _getSpotifyToken };
