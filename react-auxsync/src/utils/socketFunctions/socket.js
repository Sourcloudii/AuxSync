import { io } from "socket.io-client";
import { API_BASE } from "../apis/api";

let socket = null;

const PLAYER_ID_KEY = "auxsync-player-id";
const LAST_ROOM_KEY = "auxsync-last-room:v1";

export function getPlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function saveLastRoom(roomCode, nickname) {
  localStorage.setItem(
    LAST_ROOM_KEY,
    JSON.stringify({ roomCode, nickname, savedAt: Date.now() }),
  );
}

export function loadLastRoom() {
  try {
    const raw = localStorage.getItem(LAST_ROOM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.roomCode || !parsed?.nickname) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastRoom() {
  localStorage.removeItem(LAST_ROOM_KEY);
}

export function connectSocket(nickname, roomCode) {
  if (socket) socket.disconnect();
  
  socket = io(API_BASE || "/", {
    withCredentials: true,
    auth: { nickname, roomCode, playerId: getPlayerId() },
  });

  socket.on("connect_error", err => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function setSocketForTesting(fake) {
  socket = fake;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
