import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import Peer, { type DataConnection } from "peerjs";
import { type State, replaceState, startGame } from "../single/singleSlice";
import { isAllowed } from "./isAllowed";
import { type MultiState, resetMulti, setMulti } from "./multiSlice";

// 방장 브라우저가 서버 역할을 한다. 참가자는 PeerJS(WebRTC)로 방장에 직접 붙는다.

type Settings = { initialScore: number; initialBet: number };
type HostSave = Settings & {
	code: string;
	players: string[];
	started: boolean;
	single: State;
};
type GuestSave = { code: string; name: string };
type Message =
	| { t: "join"; name: string }
	| { t: "action"; action: UnknownAction }
	| { t: "sync"; single: State; players: string[]; started: boolean; seat: number }
	| { t: "reject"; reason: string };
type Store = {
	getState(): { single: State; multi: MultiState };
	dispatch(action: UnknownAction): unknown;
	subscribe(listener: () => void): unknown;
};

const PEER_PREFIX = "bettingman-";
const HOST_KEY = "bm-host";
const GUEST_KEY = "bm-guest";
const MAX_PLAYERS = 8;
const RETRY_MS = 3000;

let store: Store;
let peer: Peer | null = null;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let settings: Settings = { initialScore: 0, initialBet: 0 };
const guestConns = new Map<string, DataConnection>(); // 방장: 이름 → 연결
let hostConn: DataConnection | null = null; // 참가자: 방장과의 연결

const load = <T,>(key: string): T | null => {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
};

// 헷갈리는 글자(0/O, 1/I)를 뺀 6자리 방 코드
const randomCode = () =>
	Array.from(
		crypto.getRandomValues(new Uint8Array(6)),
		(n) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32]
	).join("");

// 방장: 상태가 바뀔 때마다 모든 참가자에게 보내고 localStorage 에 저장한다
function broadcast() {
	const { single, multi } = store.getState();
	if (multi.role !== "host" || !multi.code) return;
	guestConns.forEach((conn, name) => {
		if (!conn.open) return;
		const message: Message = {
			t: "sync",
			single,
			players: multi.players,
			started: multi.started,
			seat: multi.players.indexOf(name),
		};
		conn.send(message);
	});
	const save: HostSave = {
		...settings,
		code: multi.code,
		players: multi.players,
		started: multi.started,
		single,
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

function onGuestMessage(conn: DataConnection, message: Message) {
	const { single, multi } = store.getState();
	const reject = (reason: string) => {
		conn.send({ t: "reject", reason } satisfies Message);
		setTimeout(() => conn.close(), 500);
	};

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
		guestConns.get(name)?.close();
		guestConns.set(name, conn);
		conn.on("close", () => {
			if (guestConns.get(name) !== conn) return;
			guestConns.delete(name);
			// 시작 전에 나가면 자리를 비운다
			const now = store.getState().multi;
			if (now.role === "host" && !now.started)
				store.dispatch(setMulti({ players: now.players.filter((p) => p !== name) }));
		});
		if (seat === -1) store.dispatch(setMulti({ players: [...multi.players, name] }));
		else broadcast();
	} else if (message.t === "action") {
		const name = [...guestConns].find(([, c]) => c === conn)?.[0];
		const seat = name ? multi.players.indexOf(name) : -1;
		if (isAllowed(single, seat, message.action)) store.dispatch(message.action);
	}
}

function openHostPeer(code: string) {
	peer?.destroy();
	const current = new Peer(PEER_PREFIX + code);
	peer = current;
	current.on("open", () => store.dispatch(setMulti({ status: "connected", error: null })));
	current.on("connection", (conn) =>
		conn.on("data", (data) => onGuestMessage(conn, data as Message))
	);
	current.on("disconnected", () => !current.destroyed && current.reconnect());
	current.on("error", (error) => {
		// 새로고침 직후에는 중계 서버가 이전 ID 를 아직 쥐고 있을 수 있어 다시 시도한다
		if (error.type !== "unavailable-id" && error.type !== "network") return;
		store.dispatch(setMulti({ status: "connecting" }));
		clearTimeout(retryTimer);
		retryTimer = setTimeout(() => peer === current && openHostPeer(code), RETRY_MS);
	});
}

// 방 만들기. restore 를 주면 저장된 방을 같은 코드로 다시 연다.
export function hostRoom(name: string, next: Settings, restore?: HostSave) {
	const code = restore?.code ?? randomCode();
	settings = next;
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
	openHostPeer(code);
	return code;
}

// 방장이 게임을 시작한다
export function startRoom() {
	const { players } = store.getState().multi;
	startGame(store.dispatch as never, players, settings.initialScore, settings.initialBet);
	store.dispatch(setMulti({ started: true }));
}

function connectGuest(code: string, name: string) {
	peer?.destroy();
	const current = new Peer();
	peer = current;
	const retry = () => {
		if (peer !== current || store.getState().multi.status === "error") return;
		store.dispatch(setMulti({ status: "connecting" }));
		clearTimeout(retryTimer);
		retryTimer = setTimeout(() => peer === current && connectGuest(code, name), RETRY_MS);
	};
	current.on("open", () => {
		const conn = current.connect(PEER_PREFIX + code, { reliable: true });
		hostConn = conn;
		conn.on("open", () => conn.send({ t: "join", name } satisfies Message));
		conn.on("data", (data) => {
			const message = data as Message;
			if (message.t === "sync") {
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
				store.dispatch(setMulti({ status: "error", error: message.reason }));
			}
		});
		conn.on("close", retry);
	});
	current.on("error", retry);
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
	connectGuest(save.code, save.name);
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
	clearTimeout(retryTimer);
	peer?.destroy();
	peer = null;
	hostConn = null;
	guestConns.clear();
	localStorage.removeItem(HOST_KEY);
	localStorage.removeItem(GUEST_KEY);
	if (store.getState().multi.role !== "local") store.dispatch(resetMulti());
}

// 참가자가 누른 게임 액션은 로컬에서 실행하지 않고 방장에게 보낸다
export const guestMiddleware: Middleware = (api) => (next) => (action) => {
	const { type } = action as UnknownAction;
	const isGuest = (api.getState() as { multi: MultiState }).multi.role === "guest";
	if (isGuest && type.startsWith("single/") && type !== replaceState.type) {
		if (hostConn?.open) hostConn.send({ t: "action", action } as Message);
		return;
	}
	return next(action);
};
