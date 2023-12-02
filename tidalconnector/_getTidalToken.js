async function _getTidalToken(tidalClientId, tidalClientSecret) {
  const result = await fetch("https://auth.tidal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(tidalClientId + ":" + tidalClientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  const access_token = data.access_token;
  return access_token;
}

export { _getTidalToken };
