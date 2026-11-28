// 칩 소리를 Web Audio 로 합성한다. 소리 파일이 없어 형식 문제(iOS 의 OGG 등)와 내려받기가 없다.
const KEY = "bm-sound";
let context: AudioContext | null = null;

export const isSoundOn = () => localStorage.getItem(KEY) !== "off";

function audio() {
	if (!isSoundOn()) return null;
	try {
		context ??= new AudioContext();
	} catch {
		return null; // Web Audio 가 없는 환경
	}
	if (context.state === "suspended") void context.resume();
	return context;
}

export function setSoundOn(on: boolean) {
	localStorage.setItem(KEY, on ? "on" : "off");
	audio();
}

// 브라우저는 사용자가 화면을 누른 뒤에만 소리를 낸다. 누를 때마다 깨워 둔다.
if (typeof window !== "undefined") window.addEventListener("pointerdown", audio);

// 칩 하나가 부딪히는 소리: 짧은 잡음(부딪힘) + 빠르게 사라지는 높은 울림(세라믹)
function clack(ctx: AudioContext, at: number, volume: number) {
	const out = ctx.createGain();
	out.gain.setValueAtTime(volume, at);
	out.gain.exponentialRampToValueAtTime(0.001, at + 0.09);
	out.connect(ctx.destination);
	for (const frequency of [2100 + Math.random() * 500, 3300 + Math.random() * 700]) {
		const ring = ctx.createOscillator();
		ring.type = "triangle";
		ring.frequency.setValueAtTime(frequency, at);
		ring.connect(out);
		ring.start(at);
		ring.stop(at + 0.1);
	}
	const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
	const samples = buffer.getChannelData(0);
	for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
	const noise = ctx.createBufferSource();
	noise.buffer = buffer;
	const filter = ctx.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = 3500;
	noise.connect(filter).connect(out);
	noise.start(at);
}

// 칩 count 개가 차례로 떨어지는 소리. 많아도 8번까지만 낸다.
export function chipSound(count = 1) {
	const ctx = audio();
	if (!ctx) return;
	const hits = Math.min(Math.max(Math.round(count), 1), 8);
	for (let i = 0; i < hits; i++) clack(ctx, ctx.currentTime + i * 0.05 + Math.random() * 0.02, 0.2);
}
