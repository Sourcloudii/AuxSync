import { checkResponse } from "./api"

export const getGifs = ({ apiKey }) => {
    return fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=25&country_code=us&remove_low_contrast=true`).then(checkResponse);
}
