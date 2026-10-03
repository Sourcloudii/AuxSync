import { checkResponse, API_BASE } from "./api";

export const getTrendingGifs = () => {
  return fetch(`${API_BASE}/api/gifs/trending`).then(checkResponse);
};

export const searchGifs = ({ query }) => {
  return fetch(`${API_BASE}/api/gifs/search?q=${encodeURIComponent(query)}`).then(checkResponse);
};
