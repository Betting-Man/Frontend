/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	// 멀티플레이(WebCrypto)는 localhost 가 아니면 HTTPS 에서만 동작한다.
	// 폰에서 확인할 때는 `npm run dev:https` 로 자체 서명 인증서를 쓴다.
	plugins: [react(), tailwindcss(), process.env.HTTPS ? basicSsl() : null],
	resolve: { alias: { "@": path.resolve(__dirname, "src") } },
	// host: 같은 와이파이의 폰에서 접속해 확인할 수 있게 연다
	server: { port: 3000, host: true },
	test: { environment: "jsdom", globals: true },
});
