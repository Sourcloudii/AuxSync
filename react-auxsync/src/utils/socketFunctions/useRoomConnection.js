import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { roomExists, createRoom, claimSeat } from "../apis/roomApi";
import { DEFAULT_MAX_PLAYERS } from "../constants";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  getPlayerId,
  saveLastRoom,
  loadLastRoom,
  clearLastRoom,
} from "./socket";

export function useRoomConnection(onNameRestored) {
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [lobbyCode, setLobbyCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [gameState, setGameState] = useState(null);
  const [hostError, setHostError] = useState("");
  const [rejoinInfo, setRejoinInfo] = useState(null);

  const navigate = useNavigate();

  const myPlayerId = getPlayerId();
  const isWaiting = players.find(p => p.playerId === myPlayerId)?.waiting ?? false;

  useEffect(() => {
    const saved = loadLastRoom();
    if (!saved) return;
    const controller = new AbortController();
    roomExists(saved.roomCode, controller.signal)
      .then(exists => {
        if (exists) {
          setRejoinInfo(saved);
        } else {
          clearLastRoom();
        }
      })
      .catch(err => {
        console.error("Error checking room existence:", err);
      });
    return () => controller.abort();
  }, []);

  const basicLeave = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setPlayers([]);
    setLobbyCode("");
    navigate("/");
  }, [navigate]);

  const applyJoinAck = useCallback(
    (response, roomCode) => {
      setPlayers(response.players);
      setIsHost(response.isHost ?? false);
      setLobbyCode(roomCode);
      setMaxPlayers(response.maxPlayers ?? DEFAULT_MAX_PLAYERS);
      if (response.myName) onNameRestored(response.myName);
      saveLastRoom(roomCode, response.myName);
      setRejoinInfo(null);

      if (response.game) {
        setGameState(prev => ({ ...prev, ...response.game }));
        navigate("/lobby");
      } else {
        navigate("/room");
      }
    },
    [navigate, onNameRestored],
  );

  useEffect(() => {
    if (!socket) return;

    const onPlayerJoined = data => {
      setPlayers(data.players);
    };

    const onPlayersUpdated = data => {
      setPlayers(data.players);
    };

    const onPlayerLeft = data => {
      setPlayers(data.players);
      if (data.newHostId === myPlayerId) {
        setIsHost(true);
      }
    };

    const onKicked = () => {
      clearLastRoom();
      basicLeave();
      setIsHost(false);
      setGameState(null);
    };

    const onDisconnect = reason => {
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        basicLeave();
        setIsHost(false);
        setGameState(null);
      }
    };

    const onSettingsUpdated = settings => {
      setGameState(prev => (prev ? { ...prev, settings } : prev));
    };

    const onGameStarted = state => {
      setGameState(state);
      navigate("/lobby");
    };

    const onPhaseChanged = data => {
      setGameState(prev => ({
        ...prev,
        chooserReassigned: false,
        votes: undefined,
        youSubmitted: false,
        youVoted: false,
        youSkipVoted: false,
        youRpsChose: false,
        rpsChoices: undefined,
        rpsRoundWinnerIds: undefined,
        rpsRoundWinnerNames: undefined,
        rpsDraw: undefined,
        ...data,
      }));
    };

    const onRpsNextRound = data => {
      setGameState(prev => ({
        ...prev,
        rpsChoices: undefined,
        rpsRoundWinnerIds: undefined,
        rpsRoundWinnerNames: undefined,
        rpsDraw: undefined,
        youRpsChose: false,
        ...data,
      }));
    };

    const onGameUpdate = data => {
      setGameState(prev => ({ ...prev, ...data }));
    };

    const onRoundResults = data => {
      setGameState(prev => ({ ...prev, ...data, phase: "results" }));
      setPlayers(data.scoreboard);
    };

    const onGameOver = data => {
      setGameState(prev => ({ ...prev, ...data, phase: "game-over" }));
      setPlayers(data.scoreboard);
    };

    const onErrorMessage = data => {
      console.error("Server error:", data.error);
    };

    socket.on("player-joined", onPlayerJoined);
    socket.on("players-updated", onPlayersUpdated);
    socket.on("player-left", onPlayerLeft);
    socket.on("kicked", onKicked);
    socket.on("disconnect", onDisconnect);
    socket.on("settings-updated", onSettingsUpdated);
    socket.on("game-started", onGameStarted);
    socket.on("phase-changed", onPhaseChanged);
    socket.on("rps-choice-update", onGameUpdate);
    socket.on("rps-round-result", onGameUpdate);
    socket.on("rps-next-round", onRpsNextRound);
    socket.on("submission-update", onGameUpdate);
    socket.on("vote-update", onGameUpdate);
    socket.on("listening-next-song", onGameUpdate);
    socket.on("skip-vote-update", onGameUpdate);
    socket.on("round-results", onRoundResults);
    socket.on("game-over", onGameOver);
    socket.on("error-message", onErrorMessage);

    return () => {
      socket.off("player-joined", onPlayerJoined);
      socket.off("players-updated", onPlayersUpdated);
      socket.off("player-left", onPlayerLeft);
      socket.off("kicked", onKicked);
      socket.off("disconnect", onDisconnect);
      socket.off("settings-updated", onSettingsUpdated);
      socket.off("game-started", onGameStarted);
      socket.off("phase-changed", onPhaseChanged);
      socket.off("rps-choice-update", onGameUpdate);
      socket.off("rps-round-result", onGameUpdate);
      socket.off("rps-next-round", onRpsNextRound);
      socket.off("submission-update", onGameUpdate);
      socket.off("vote-update", onGameUpdate);
      socket.off("listening-next-song", onGameUpdate);
      socket.off("skip-vote-update", onGameUpdate);
      socket.off("round-results", onRoundResults);
      socket.off("game-over", onGameOver);
      socket.off("error-message", onErrorMessage);
    };
  }, [socket, basicLeave, navigate, myPlayerId]);

  const openRoomConnection = useCallback(
    async (nickname, roomCode) => {
      // Claim the seat over HTTP first: that response is what sets the HttpOnly
      // cookie the handshake below authenticates with.
      try {
        await claimSeat(roomCode, nickname, getPlayerId());
      } catch (err) {
        return { error: err.message || "Could not join the room" };
      }

      const socket = connectSocket(nickname, roomCode);
      setSocket(socket);

      return new Promise(resolve => {
        const timeout = setTimeout(() => {
          resolve({ error: "Could not connect to the room" });
        }, 10000);

        socket.once("connect_error", err => {
          clearTimeout(timeout);
          resolve({ error: err.message || "Could not connect to the room" });
        });

        socket.on("connect", () => {
          socket.emit("join-room", response => {
            clearTimeout(timeout);
            if (response?.error) {
              resolve({ error: response.error });
              return;
            }
            applyJoinAck(response, roomCode);
            resolve({ success: true });
          });
        });
      });
    },
    [applyJoinAck],
  );

  const hostRoom = useCallback(
    async nickname => {
      setHostError("");
      try {
        const data = await createRoom(nickname);
        const result = await openRoomConnection(nickname, data.roomCode);
        if (result?.error) {
          setHostError(result.error);
        }
      } catch (err) {
        console.error("Failed to create room:", err);
        setHostError(err.message);
      }
    },
    [openRoomConnection],
  );

  const joinRoom = useCallback(
    // No separate existence check: claiming the seat inside openRoomConnection
    // already 404s on an unknown room code.
    (nickname, roomCode) => openRoomConnection(nickname, roomCode),
    [openRoomConnection],
  );

  const rejoinRoom = useCallback(async () => {
    if (!rejoinInfo) return;
    const result = await openRoomConnection(rejoinInfo.nickname, rejoinInfo.roomCode);
    if (result?.error) {
      clearLastRoom();
      setRejoinInfo(null);
      setHostError(result.error);
    }
  }, [rejoinInfo, openRoomConnection]);

  const dismissRejoin = useCallback(() => {
    clearLastRoom();
    setRejoinInfo(null);
  }, []);

  const startGame = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("start-game", response => {
      if (response?.error) {
        console.error(response.error);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket?.connected) socket.emit("leave-room");
    clearLastRoom();
    setRejoinInfo(null);
    basicLeave();
    setIsHost(false);
    setGameState(null);
  }, [basicLeave]);

  return {
    players,
    isHost,
    lobbyCode,
    maxPlayers,
    gameState,
    hostError,
    rejoinInfo,
    myPlayerId,
    isWaiting,
    hostRoom,
    joinRoom,
    rejoinRoom,
    dismissRejoin,
    startGame,
    leaveRoom,
  };
}
