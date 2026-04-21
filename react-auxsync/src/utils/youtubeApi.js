import { checkResponse } from "./api";

export const searchVideos = (query, signal) => {
  return fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
    signal,
  }).then(checkResponse);
};
