// 방 코드 하나가 Durable Object 하나다. 방장과 참가자 사이의 메시지를 웹소켓으로 중계한다.
// 게임 상태는 방장 브라우저가 갖는다. 서버는 누가 방장인지만 기억한다.
import { DurableObject } from "cloudflare:workers";

const DAY = 24 * 60 * 60 * 1000;

export class Room extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		// 잠든 상태(hibernation)를 깨우지 않고 ping 에 답한다
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
	}

	async fetch(request) {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		const secret = url.searchParams.get("host");
		if (request.headers.get("Upgrade") !== "websocket" || !id)
			return new Response("websocket only", { status: 426 });

		// 방을 처음 연 사람의 secret 을 기억한다. 그 secret 을 가진 연결만 방장이다.
		if (secret) {
			const saved = await this.ctx.storage.get("secret");
			if (saved && saved !== secret) return new Response("not the host", { status: 403 });
			if (!saved) await this.ctx.storage.put("secret", secret);
		}
		const tag = secret ? "host" : `guest:${id}`;
		for (const old of this.ctx.getWebSockets(tag)) old.close(4000, "replaced");

		const [client, server] = Object.values(new WebSocketPair());
		this.ctx.acceptWebSocket(server, [tag]);
		server.serializeAttachment({ id, host: Boolean(secret) });
		if (secret) this.toGuests({ t: "up" });
		return new Response(null, { status: 101, webSocket: client });
	}

	toGuests(message) {
		for (const socket of this.ctx.getWebSockets())
			if (!socket.deserializeAttachment().host) socket.send(JSON.stringify(message));
	}

	toHost(message) {
		for (const socket of this.ctx.getWebSockets("host")) socket.send(JSON.stringify(message));
	}

	webSocketMessage(socket, data) {
		if (typeof data !== "string") return;
		const { id, host } = socket.deserializeAttachment();
		let message;
		try {
			message = JSON.parse(data);
		} catch {
			return;
		}
		if (host) {
			// 방장 → 참가자 한 명. to 는 참가자 id.
			const { to, ...rest } = message;
			for (const guest of this.ctx.getWebSockets(`guest:${to}`)) guest.send(JSON.stringify(rest));
		} else {
			// 참가자 → 방장. from 은 서버가 붙이므로 남을 흉내 낼 수 없다.
			this.toHost({ ...message, from: id });
		}
	}

	async webSocketClose(socket) {
		const { id, host } = socket.deserializeAttachment();
		const others = this.ctx.getWebSockets().filter((other) => other !== socket);
		if (!host) this.toHost({ t: "leave", from: id });
		// 방장이 새로고침하면 새 연결이 먼저 붙을 수 있다. 남은 방장 연결이 없을 때만 알린다.
		else if (!others.some((other) => other.deserializeAttachment().host))
			this.toGuests({ t: "down" });
		// 아무도 없는 방은 하루 뒤에 지운다
		if (others.length === 0) await this.ctx.storage.setAlarm(Date.now() + DAY);
	}

	webSocketError(socket) {
		return this.webSocketClose(socket);
	}

	async alarm() {
		if (this.ctx.getWebSockets().length === 0) await this.ctx.storage.deleteAll();
	}
}

export default {
	fetch(request, env) {
		const code = new URL(request.url).pathname.match(/^\/room\/([A-Z2-9]{6})$/)?.[1];
		if (!code) return new Response("not found", { status: 404 });
		return env.ROOM.get(env.ROOM.idFromName(code)).fetch(request);
	},
};
