import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { type State, replaceState, startGame } from "../single/singleSlice";
import { isAllowed } from "./isAllowed";
import { type MultiState, resetMulti, setMulti } from "./multiSlice";

// 방장 브라우저가 게임 상태를 갖는다. 방장과 참가자는 Cloudflare Worker(server/room.js)를 거쳐 메시지를 주고받는다.
// WebRTC 직접 연결은 TURN 서버 없이는 폰에서 실패해서 쓰지 않는다.

type Settings = { initialScore: number; initialBet: number };
type HostSave = Settings & {
	code: string;
	players: string[];
	started: boolean;
	single: State;
	secret: string;
};
type GuestSave = { code: string; name: string };
type Message =
	| { t: "join"; name: string }
	| { t: "action"; action: UnknownAction }
	| { t: "sync"; single: State; players: string[]; started: boolean; seat: number }
	| { t: "reject"; reason: string }
	| { t: "up" } // 방장이 들어왔다
	| { t: "down" } // 방장이 나갔다
	| { t: "leave" }; // 참가자가 나갔다
type Store = {
	getState(): { single: State; multi: MultiState };
	dispatch(action: UnknownAction): unknown;
	subscribe(listener: () => void): unknown;
};

const SERVER = import.meta.env.VITE_ROOM_SERVER ?? "wss://betting-man-room.rhljh7410.workers.dev";
const HOST_KEY = "bm-host";
const GUEST_KEY = "bm-guest";
const MAX_PLAYERS = 8;

let store: Store;
let socket: WebSocket | null = null;
let secret = ""; // 방장: 서버가 방장을 알아보는 값
let settings: Settings = { initialScore: 0, initialBet: 0 };
const guestPeers = new Map<string, string>(); // 방장: 이름 → 참가자 id

const load = <T,>(key: string): T | null => {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
};

// 방장 → 참가자 한 명. 참가자 → 방장은 서버가 보낸 사람(from)을 붙여 전한다.
const send = (message: Message, target: string) =>
	socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ ...message, to: target }));
const sendToHost = (message: Message) =>
	socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify(message));

function closeRoom() {
	const old = socket;
	socket = null; // 먼저 비워야 close 이벤트가 다시 붙지 않는다
	old?.close();
	guestPeers.clear();
}

// 방 코드의 서버 방에 붙는다. 이전 방은 떠난다. 끊기면 1초 뒤 다시 붙는다.
function openRoom(
	code: string,
	query: string,
	onConnect: () => void,
	onMessage: (message: Message & { from?: string }) => void
) {
	closeRoom();
	const connect = () => {
		const current = new WebSocket(`${SERVER}/room/${code}?id=${me}${query}`);
		socket = current;
		// 폰이 잠들었다 깨면 끊긴 줄 모르는 연결이 남는다. ping 을 보내 끊김을 드러낸다.
		const ping = setInterval(() => current.readyState === WebSocket.OPEN && current.send("ping"), 30_000);
		current.onopen = onConnect;
		current.onmessage = ({ data }) => {
			if (data === "pong") return;
			try {
				onMessage(JSON.parse(data));
			} catch {
				// 깨진 메시지는 버린다
			}
		};
		current.onclose = () => {
			clearInterval(ping);
			if (socket !== current) return;
			store.dispatch(setMulti({ status: "connecting" }));
			setTimeout(() => socket === current && connect(), 1000);
		};
	};
	connect();
}

// 헷갈리는 글자(0/O, 1/I)를 뺀 6자리 방 코드
const randomCode = () =>
	Array.from(
		crypto.getRandomValues(new Uint8Array(6)),
		(n) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32]
	).join("");

const me = randomCode() + randomCode(); // 이 탭의 id

// 방장: 상태가 바뀔 때마다 모든 참가자에게 보내고 localStorage 에 저장한다
function broadcast() {
	const { single, multi } = store.getState();
	if (multi.role !== "host" || !multi.code) return;
	guestPeers.forEach((peerId, name) =>
		send(
			{
				t: "sync",
				single,
				players: multi.players,
				started: multi.started,
				seat: multi.players.indexOf(name),
			},
			peerId
		)
	);
	const save: HostSave = {
		...settings,
		code: multi.code,
		players: multi.players,
		started: multi.started,
		single,
		secret,
	};
	localStorage.setItem(HOST_KEY, JSON.stringify(save));
}

export function bindStore(target: Store) {
	store = target;
	let previous = store.getState();
	store.subscribe(() => {
		const current = store.getState();
		if (current.single !== previous.single || current.multi !== previous.multi) {
			previous = current;
			broadcast();
		}
	});
}

function onGuestMessage(peerId: string, message: Message) {
	const { single, multi } = store.getState();
	const reject = (reason: string) => send({ t: "reject", reason }, peerId);

	if (message.t === "join") {
		const name = String(message.name ?? "").trim().slice(0, 8);
		const seat = multi.players.indexOf(name);
		if (!name) return reject("이름을 입력하세요.");
		if (seat === 0) return reject("방장이 쓰는 이름이에요.");
		if (seat === -1) {
			// 같은 이름으로 다시 들어오면 원래 자리를 되찾는다. 새 이름은 시작 전에만 받는다.
			if (multi.started) return reject("이미 시작한 게임이에요.");
			if (multi.players.length >= MAX_PLAYERS) return reject("방이 가득 찼어요.");
		}
		guestPeers.set(name, peerId);
		if (seat === -1) store.dispatch(setMulti({ players: [...multi.players, name] }));
		else broadcast();
	} else if (message.t === "action") {
		const name = [...guestPeers].find(([, id]) => id === peerId)?.[0];
		const seat = name ? multi.players.indexOf(name) : -1;
		if (isAllowed(single, seat, message.action)) store.dispatch(message.action);
	}
}

function onGuestLeave(id: string) {
	const name = [...guestPeers].find(([, peerId]) => peerId === id)?.[0];
	if (!name) return;
	guestPeers.delete(name);
	// 시작 전에 나가면 자리를 비운다
	const now = store.getState().multi;
	if (now.role === "host" && !now.started)
		store.dispatch(setMulti({ players: now.players.filter((p) => p !== name) }));
}

function openHostRoom(code: string) {
	openRoom(
		code,
		`&host=${secret}`,
		// 서버가 먼저 와 있던 참가자에게 방장이 왔다고 알리고, 참가자가 다시 참가를 알린다
		() => store.dispatch(setMulti({ status: "connected", error: null })),
		(message) => {
			if (!message.from) return;
			if (message.t === "leave") onGuestLeave(message.from);
			else onGuestMessage(message.from, message);
		}
	);
}

// 방 만들기. restore 를 주면 저장된 방을 같은 코드로 다시 연다.
export function hostRoom(name: string, next: Settings, restore?: HostSave) {
	const code = restore?.code ?? randomCode();
	settings = next;
	secret = restore?.secret ?? randomCode() + randomCode();
	localStorage.removeItem(GUEST_KEY); // 한 브라우저는 한 방에서 한 역할만 한다
	if (restore) store.dispatch(replaceState(restore.single));
	store.dispatch(
		setMulti({
			role: "host",
			seat: 0,
			code,
			players: restore?.players ?? [name.trim().slice(0, 8)],
			started: restore?.started ?? false,
			status: "connecting",
			error: null,
		})
	);
	openHostRoom(code);
	return code;
}

// 방장이 게임을 시작한다
export function startRoom() {
	const { players } = store.getState().multi;
	startGame(store.dispatch as never, players, settings.initialScore, settings.initialBet);
	store.dispatch(setMulti({ started: true }));
}

function openGuestRoom(code: string, name: string) {
	const join = () => sendToHost({ t: "join", name });
	openRoom(code, "", join, (message) => {
		if (message.t === "up") join();
		else if (message.t === "down") store.dispatch(setMulti({ status: "connecting" }));
		else if (message.t === "sync") {
			store.dispatch(replaceState(message.single));
			store.dispatch(
				setMulti({
					players: message.players,
					started: message.started,
					seat: message.seat,
					status: "connected",
					error: null,
				})
			);
		} else if (message.t === "reject") {
			localStorage.removeItem(GUEST_KEY);
			closeRoom();
			store.dispatch(setMulti({ status: "error", error: message.reason }));
		}
	});
}

// 방 코드로 참가한다
export function joinRoom(code: string, name: string) {
	const save: GuestSave = { code: code.trim().toUpperCase(), name: name.trim().slice(0, 8) };
	localStorage.removeItem(HOST_KEY); // 한 브라우저는 한 방에서 한 역할만 한다
	localStorage.setItem(GUEST_KEY, JSON.stringify(save));
	store.dispatch(
		setMulti({
			role: "guest",
			seat: null,
			code: save.code,
			players: [],
			started: false,
			status: "connecting",
			error: null,
		})
	);
	openGuestRoom(save.code, save.name);
}

// 새로고침 뒤 저장된 방으로 돌아간다. code 를 주면 그 방일 때만 돌아간다.
export function restoreRoom(code?: string) {
	if (store.getState().multi.role !== "local") return true;
	const host = load<HostSave>(HOST_KEY);
	if (host && (!code || host.code === code)) {
		hostRoom(host.players[0], host, host);
		return true;
	}
	const guest = load<GuestSave>(GUEST_KEY);
	if (guest && (!code || guest.code === code)) {
		joinRoom(guest.code, guest.name);
		return true;
	}
	return false;
}

// 방에서 나간다. 저장된 방 정보도 지운다.
export function leaveRoom() {
	closeRoom();
	localStorage.removeItem(HOST_KEY);
	localStorage.removeItem(GUEST_KEY);
	if (store.getState().multi.role !== "local") store.dispatch(resetMulti());
}

// 참가자가 누른 게임 액션은 로컬에서 실행하지 않고 방장에게 보낸다
export const guestMiddleware: Middleware = (api) => (next) => (action) => {
	const { type } = action as UnknownAction;
	const isGuest = (api.getState() as { multi: MultiState }).multi.role === "guest";
	if (isGuest && type.startsWith("single/") && type !== replaceState.type) {
		sendToHost({ t: "action", action } as Message);
		return;
	}
	return next(action);
};
