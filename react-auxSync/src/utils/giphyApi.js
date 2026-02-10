import { checkResponse } from "./api";

export const getTrendingGifs = ({ apiKey }) => {
  return fetch(
    `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=50&country_code=us&remove_low_contrast=true`,
  ).then(checkResponse);
};
