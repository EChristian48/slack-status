import mitt from "mitt";
import { ResponseAPIToken } from "../services/spotify";

type Events = {
  "logged-in": ResponseAPIToken;
  "refreshed-token": ResponseAPIToken;
};

export const emitter = mitt<Events>();
