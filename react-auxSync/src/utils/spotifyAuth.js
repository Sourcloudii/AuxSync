const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
//Move to backend
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const REFRESH_INTERVAL = 55 * 60 * 1000;

let refreshTimerId = null;
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming",
];

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "token",
    scope: SCOPES.join(" "),
    show_dialog: "true",
  });

  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export function refreshAccessToken() {
  return fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })
    .then(res => {
      if (!res.ok) return Promise.reject(`Token refresh failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      return data.access_token;
    });
}

export function startAutoRefresh(onTokenRefreshed) {
  stopAutoRefresh();

  refreshAccessToken().then(onTokenRefreshed);

  refreshTimerId = setInterval(() => {
    refreshAccessToken().then(onTokenRefreshed);
  }, REFRESH_INTERVAL);
}

export function stopAutoRefresh() {
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
  }
}
