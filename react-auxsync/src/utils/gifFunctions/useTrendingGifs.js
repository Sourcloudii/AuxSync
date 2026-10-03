import { useState, useEffect } from "react";

import { getTrendingGifs } from "../apis/giphyApi";

export function useTrendingGifs() {
  const [gifs, setGifs] = useState([]);
  const [positionedGifs, setPositionedGifs] = useState([]);

  useEffect(() => {
    getTrendingGifs()
      .then(e => {
        setGifs(e.data);
        setPositionedGifs(
          e.data.map(gif => ({
            ...gif,
            positionLeft: Math.random() * 100,
            positionTop: Math.random() * 20 + 10,
            duration: Math.random() * 10 + 9,
            opacity: Math.random() * 0.5 + 0.2,
          })),
        );
      })
      .catch(err => {
        console.error("Failed to fetch trending gifs:", err);
      });
  }, []);

  return { gifs, positionedGifs };
}
