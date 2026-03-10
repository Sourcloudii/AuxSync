import { checkResponse } from "./api";
const BASE_URL = "https://api.spotify.com/v1";

function headers(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export const searchTracks = (accessToken, query, signal) => {
  return fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    { headers: headers(accessToken), signal }
  ).then(checkResponse);
};
