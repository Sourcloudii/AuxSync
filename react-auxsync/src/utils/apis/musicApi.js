import { checkResponse, API_BASE } from "./api";

export const searchVideos = (query, signal, roomCode) => {
  const url = `${API_BASE}/api/youtube/search?q=${encodeURIComponent(query)}${roomCode ? `&room=${encodeURIComponent(roomCode)}` : ""}`;
  return fetch(url, { signal }).then(checkResponse);
};
