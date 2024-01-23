import { ofetch } from "ofetch";
import path from "path";
import { writeFile } from "fs/promises";

export const DOWNLOAD_PATH = path.join(process.cwd(), "/assets/profile.png");

export const downloadProfilePic = async (url: string) => {
  const response = await ofetch<Blob>(url);
  const buffer = await response.arrayBuffer();

  writeFile(DOWNLOAD_PATH, Buffer.from(buffer), "binary");
};
