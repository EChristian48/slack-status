import fastify from "fastify";
import { emitter } from "./lib/mitt";
import {
  Query,
  ResponseCurrentlyPlaying,
  spotify,
} from "./lib/services/spotify";
import { minutesToMs, secondsToMs } from "./lib/utils/time";
import { slack } from "./lib/services/slack/slack";
import { downloadProfilePic } from "./lib/utils/picture";
import { Page } from "puppeteer";

const server = fastify();

server.get("/", async (request) => {
  const query = request.query as Query;
  const response = await spotify.getAccessToken(query.code);
  spotify.token = response.access_token;

  emitter.emit("logged-in", response);
  return `Logged in!`;
});

server.listen({ port: parseInt(import.meta.env.VITE_PORT) });

await spotify.openSpotifyOAuth();

let prevTrack: ResponseCurrentlyPlaying | undefined = undefined;

const updateSong = async (page: Page) => {
  const response = await spotify.getCurrentlyPlaying();

  if (!response?.item?.name) {
    await slack.updateStatus(page, "Nothing playing...");
    console.log("Updated status:", "Nothing playing...");
    return;
  }

  const statusString = `${response.item.name} - ${response.item.artists
    .map((artist) => artist.name)
    .join(", ")}`;

  const SCALE = 10;

  const progress = Math.floor(
    (response.progress_ms / response.item.duration_ms) * SCALE
  );

  const progressString = Array(SCALE).fill("-").fill("=", 0, progress).join("");

  const combinedString = `${statusString} [${progressString}]`;

  await slack.updateStatus(page, combinedString);

  console.log("Updated status:", combinedString);

  if (prevTrack?.item.id !== response.item.id) {
    await downloadProfilePic(
      response.item.album.images[0]?.url ?? "https://placehold.co/640"
    );

    await slack.updateProfilePic(page);

    console.log("Updated profile pic: ", response.item.album.images[0]?.url);

    prevTrack = response;
  }
};

emitter.on("logged-in", async ({ refresh_token }) => {
  server.close();

  setInterval(async () => {
    const response = await spotify.refreshToken(refresh_token);
    emitter.emit("refreshed-token", response);
  }, minutesToMs(30));

  const page = await slack.openSlack();
  await slack.signIn(page);
  console.log("Signed in to Slack");

  await updateSong(page);

  setInterval(() => {
    updateSong(page);
  }, secondsToMs(20));
});

emitter.on("refreshed-token", ({ access_token }) => {
  spotify.token = access_token;
});
