import { ofetch } from "ofetch";
import { ResponseAPIToken, ResponseCurrentlyPlaying } from "./spotify.types";
import open from "open";

const BASE_URL_SPOTIFY_AUTH = "https://accounts.spotify.com";
const BASE_URL_SPOTIFY_API = "https://api.spotify.com/v1";
const SCOPE = "user-read-currently-playing";
const REDIRECT_URI = `http://localhost:${import.meta.env.VITE_PORT}`;

const auth = ofetch.create({
  baseURL: BASE_URL_SPOTIFY_AUTH,
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
        import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
      }`
    ).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

const api = ofetch.create({
  baseURL: BASE_URL_SPOTIFY_API,
  onRequest({ options }) {
    options.headers = {
      Authorization: `Bearer ${spotify.token}`,
      ...options.headers,
    };
  },
});

const openSpotifyOAuth = () => {
  const urlParams = new URLSearchParams({
    response_type: "code",
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
  });

  const url = `${BASE_URL_SPOTIFY_AUTH}/authorize?${urlParams.toString()}`;

  return open(url);
};

const getAccessToken = async (code: string) => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  return auth<ResponseAPIToken>("/api/token", {
    method: "POST",
    body: body.toString(),
  });
};

const refreshToken = async (refreshToken: string) => {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return auth<ResponseAPIToken>("/api/token", {
    method: "POST",
    body: body.toString(),
  });
};

const getCurrentlyPlaying = () => {
  return api<ResponseCurrentlyPlaying>("/me/player/currently-playing", {
    query: { market: "ID" },
  });
};

export const spotify = {
  openSpotifyOAuth,
  getAccessToken,
  refreshToken,
  getCurrentlyPlaying,
  token: "",
};
