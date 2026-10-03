import { checkResponse, API_BASE } from "./api";

const request = async (url, fallbackError, options) => {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error(fallbackError);
  }
  return checkResponse(res, fallbackError);
};

export const createRoom = nickname =>
  request(`${API_BASE}/api/rooms/`, "Failed to create room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });

export const getRoom = roomCode => request(`${API_BASE}/api/rooms/${roomCode}`, "Failed to join room");

export const claimSeat = (roomCode, nickname, playerId) =>
  request(`${API_BASE}/api/rooms/${roomCode}/seat`, "Failed to join room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ nickname, playerId }),
  });

export const roomExists = async (roomCode, signal) => {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}`, { signal });
  if (res.status === 404) return false;
  await checkResponse(res);
  return true;
};
