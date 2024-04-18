class SpotifySongResponse {
  constructor(data) {
    this.album = {
      name: data.album.name,
      release_date: data.album.release_date,
      release_date_precision: data.album.release_date_precision,
      total_tracks: data.album.total_tracks,
      type: data.album.type,
      available_markets: data.album.available_markets[0],
    };
    this.artists = data.artists.map((artist) => ({ name: artist.name }));
    this.duration_ms = data.duration_ms;
    this.name = data.name;
    this.track_number = data.track_number;
  }

  static fromJSON(data) {
    return new SpotifySongResponse(data);
  }
}

export default SpotifySongResponse;
