/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: { alias: { "@": path.resolve(__dirname, "src") } },
	// host: 같은 와이파이의 폰에서 접속해 확인할 수 있게 연다
	server: { port: 3000, host: true },
	test: { environment: "jsdom", globals: true },
});
