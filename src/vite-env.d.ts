/// <reference types="vite-node/client" />

interface ImportMetaEnv {
  readonly VITE_SLACK_WORKSPACE: string;
  readonly VITE_SLACK_EMAIL: string;
  readonly VITE_SLACK_PASSWORD: string;
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_SPOTIFY_CLIENT_SECRET: string;
  readonly VITE_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
