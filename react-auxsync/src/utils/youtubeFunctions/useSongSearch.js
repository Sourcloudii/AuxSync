import { useState, useRef, useCallback } from "react";

import { searchVideos } from "../apis/musicApi";

export function useSongSearch(lobbyCode) {
  const [searchResults, setSearchResults] = useState([]);
  const searchControllerRef = useRef(null);
  const searchTimerRef = useRef(null);

  const resetSearch = useCallback(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
      searchControllerRef.current = null;
    }
    setSearchResults([]);
  }, []);

  const handleSongSearchChange = e => {
    const query = e.target.value;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }

    if (query) {
      searchTimerRef.current = setTimeout(() => {
        const controller = new AbortController();
        searchControllerRef.current = controller;

        searchVideos(query, controller.signal, lobbyCode)
          .then(data => {
            setSearchResults(data.items);
          })
          .catch(err => {
            if (err.name !== "AbortError") console.error(err);
          });
      }, 600);
    } else {
      searchControllerRef.current = null;
      setSearchResults([]);
    }
  };

  return { searchResults, handleSongSearchChange, resetSearch };
}
