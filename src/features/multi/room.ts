import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { type JsonValue, type MessageAction, type Room, joinRoom as openP2PRoom } from "trystero";
import { type State, replaceState, startGame } from "../single/singleSlice";
import { isAllowed } from "./isAllowed";
import { type MultiState, resetMulti, setMulti } from "./multiSlice";

// 방장 브라우저가 서버 역할을 한다. 참가자는 Trystero(WebRTC)로 방장에 직접 붙는다.
// 서로를 찾는 중계는 Trystero 가 여러 공개 릴레이에 나눠 맡긴다. 게임 데이터는 릴레이를 지나지 않는다.

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

const APP_ID = "betting-man/frontend";
const HOST_KEY = "bm-host";
const GUEST_KEY = "bm-guest";
const MAX_PLAYERS = 8;

let store: Store;
let room: Room | null = null;
let channel: MessageAction<JsonValue> | null = null;
let settings: Settings = { initialScore: 0, initialBet: 0 };
const guestPeers = new Map<string, string>(); // 방장: 이름 → 참가자 peerId
let hostPeerId: string | null = null; // 참가자: 방장 peerId

const load = <T,>(key: string): T | null => {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
};

const send = (message: Message, target: string) =>
	channel?.send(message as unknown as JsonValue, { target }).catch(() => {});

// 방 코드로 P2P 방에 들어간다. 이전 방은 떠난다.
function openRoom(code: string) {
	room?.leave();
	guestPeers.clear();
	hostPeerId = null;
	// identity "none": 같은 브라우저의 탭도 서로 다른 사람으로 본다
	const current = openP2PRoom({ appId: APP_ID, identity: "none" }, code);
	room = current;
	channel = current.makeAction<JsonValue>("msg");
	current.onError((error) => console.warn("[room]", error));
	return current;
}

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

function openHostRoom(code: string) {
	const current = openRoom(code);
	channel?.onMessage((data, { peerId }) => onGuestMessage(peerId, data as unknown as Message));
	current.onPeerLeave(({ peerId }) => {
		const name = [...guestPeers].find(([, id]) => id === peerId)?.[0];
		if (!name) return;
		guestPeers.delete(name);
		// 시작 전에 나가면 자리를 비운다
		const now = store.getState().multi;
		if (now.role === "host" && !now.started)
			store.dispatch(setMulti({ players: now.players.filter((p) => p !== name) }));
	});
	current.ready.then(
		() => room === current && store.dispatch(setMulti({ status: "connected", error: null })),
		(error) => console.warn("[room] host", error)
	);
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
	const current = openRoom(code);
	// 누가 방장인지 모르므로 들어오는 모든 상대에게 참가를 알린다. 방장만 답한다.
	current.onPeerJoin(({ peerId }) => send({ t: "join", name }, peerId));
	current.onPeerLeave(({ peerId }) => {
		if (peerId !== hostPeerId) return;
		// 방장이 새로고침하면 새 peerId 로 다시 들어온다
		hostPeerId = null;
		store.dispatch(setMulti({ status: "connecting" }));
	});
	channel?.onMessage((data, { peerId }) => {
		const message = data as unknown as Message;
		// 처음 답한 상대를 방장으로 보고, 다른 상대가 보낸 상태는 받지 않는다
		if (hostPeerId && hostPeerId !== peerId) return;
		if (message.t === "sync") {
			hostPeerId = peerId;
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
			current.leave();
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
	room?.leave();
	room = null;
	channel = null;
	hostPeerId = null;
	guestPeers.clear();
	localStorage.removeItem(HOST_KEY);
	localStorage.removeItem(GUEST_KEY);
	if (store.getState().multi.role !== "local") store.dispatch(resetMulti());
}

// 참가자가 누른 게임 액션은 로컬에서 실행하지 않고 방장에게 보낸다
export const guestMiddleware: Middleware = (api) => (next) => (action) => {
	const { type } = action as UnknownAction;
	const isGuest = (api.getState() as { multi: MultiState }).multi.role === "guest";
	if (isGuest && type.startsWith("single/") && type !== replaceState.type) {
		if (hostPeerId) send({ t: "action", action } as Message, hostPeerId);
		return;
	}
	return next(action);
};
