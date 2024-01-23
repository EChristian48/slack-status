import { defineConfig } from "vite";
import tsConfig from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsConfig()],
});
