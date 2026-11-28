import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RootState } from "../../app/store";
import { CHIP_COLORS, CHIP_VALUES, toChips } from "../../features/single/chips";
import UserCard from "../UserCard/UserCard";

const MODEL_URL = "/models/poker-chip.glb";
const PERSON_URL = "/models/person.glb";
// 사람마다 다른 셔츠 색
const SHIRTS = ["#dc2626", "#2563eb", "#e5b94e", "#9333ea", "#ea580c", "#0891b2", "#db2777", "#f5f5f4"];
const STACK_SIZE = 10; // 한 더미에 쌓는 칩 수
const FLY_SECONDS = 0.6;

type Chip = {
	key: string;
	value: number;
	from: THREE.Vector3;
	to: THREE.Vector3;
	delay: number; // 여러 칩이 차례로 날아가게 하는 지연(초)
	leavingUntil?: number; // 팟에서 빠져나가는 칩을 지울 시각(ms)
	selected?: boolean; // 베팅에 들어갈 칩 - 노란 테두리를 두른다
};

// 테이블: 가운데 뒤에 공용 팟, 가장 앞에 내 칩
const POT = new THREE.Vector3(0, 0, 0.2);
const HAND = new THREE.Vector3(0, 0, 2.6);
// 내 칩은 5000 칩 한 개로 뭉치지 않게 1000 이하로만 쌓는다
const HAND_VALUES = CHIP_VALUES.filter((value) => value < 5000);

const CENTER = new THREE.Vector3(0, 0, 0.3); // 테이블 한가운데

// 다른 사람이 앉는 자리 - 내 왼쪽부터 시계 방향으로 테이블 건너편에 둘러앉는다
const seatOf = (index: number, seat: number, userCount: number) => {
	const order = (index - seat - 1 + userCount) % userCount; // 0 = 내 다음 사람
	const angle = Math.PI * (0.94 - (0.88 * (order + 1)) / userCount);
	return new THREE.Vector3(4.6 * Math.cos(angle), 0, CENTER.z - 4.8 * Math.sin(angle));
};
// 사람이 많으면 서로 겹치지 않게 작게 그린다
const personScale = (userCount: number) => (userCount > 5 ? 0.75 : 1);
// 그 사람 앞에 놓인 칩 자리. 내 칩은 HAND 에 있다.
const chipsOf = (index: number, seat: number, userCount: number) =>
	index === seat ? HAND : seatOf(index, seat, userCount).lerp(CENTER, 0.36);

// 모델을 지름 1, 바닥 y=0 으로 맞추고 흰 부분과 색 부분으로 나눈다
function useChipModel() {
	const { scene } = useGLTF(MODEL_URL);
	return useMemo(() => {
		scene.updateMatrixWorld(true);
		const box = new THREE.Box3().setFromObject(scene);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());
		const scale = 1 / Math.max(size.x, size.z);
		const fit = new THREE.Matrix4()
			.makeScale(scale, scale, scale)
			.multiply(new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z));
		const parts: { geometry: THREE.BufferGeometry; colored: boolean }[] = [];
		scene.traverse((object) => {
			const mesh = object as THREE.Mesh;
			if (!mesh.isMesh) return;
			const { color } = mesh.material as THREE.MeshStandardMaterial;
			parts.push({
				geometry: mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).applyMatrix4(fit),
				colored: color.r - color.g > 0.5, // 원본의 빨간 재질
			});
		});
		const materials = Object.fromEntries(
			CHIP_VALUES.map((value) => [
				value,
				{
					colored: new THREE.MeshStandardMaterial({ color: CHIP_COLORS[value], roughness: 0.55 }),
					// 흰 칩은 무늬가 보이게 테두리 조각을 회색으로 칠한다
					plain: new THREE.MeshStandardMaterial({ color: value === 50 ? "#64748b" : "#f5f5f4", roughness: 0.55 }),
				},
			])
		);
		return { parts, materials, height: size.y * scale };
	}, [scene]);
}

type ChipModel = ReturnType<typeof useChipModel>;

function ChipMesh({ chip, model }: { chip: Chip; model: ChipModel }) {
	const group = useRef<THREE.Group>(null!);
	const flight = useRef({ start: chip.from.clone(), progress: -chip.delay / FLY_SECONDS });

	// 목표 위치가 바뀌면 지금 위치에서 다시 날아간다
	useEffect(() => {
		const waiting = flight.current.progress < 0;
		flight.current = {
			start: group.current.position.clone(),
			progress: waiting ? flight.current.progress : 0,
		};
	}, [chip.to]);

	useFrame((state, delta) => {
		const current = flight.current;
		if (current.progress >= 1) return;
		state.invalidate(); // frameloop="demand" - 날아가는 동안만 다시 그린다
		current.progress = Math.min(1, current.progress + Math.min(delta, 0.05) / FLY_SECONDS);
		group.current.visible = current.progress > 0;
		if (current.progress <= 0) return;
		const eased = 1 - (1 - current.progress) ** 3;
		group.current.position.lerpVectors(current.start, chip.to, eased);
		// 멀리서 날아올 때만 포물선을 그린다
		if (current.start.distanceTo(chip.to) > 1)
			group.current.position.y += Math.sin(Math.PI * eased) * 1.2;
	});

	return (
		<group ref={group} position={chip.from} visible={false}>
			{model.parts.map((part, index) => (
				<mesh
					key={index}
					geometry={part.geometry}
					material={model.materials[chip.value][part.colored ? "colored" : "plain"]}
				/>
			))}
			{chip.selected && (
				<mesh position-y={model.height / 2} rotation-x={Math.PI / 2}>
					<torusGeometry args={[0.52, 0.05, 8, 40]} />
					<meshBasicMaterial color="#facc15" />
				</mesh>
			)}
		</group>
	);
}

type PileProps = {
	id: string;
	amount: number;
	selected?: number; // amount 중 노란 테두리를 두를 금액
	origin: THREE.Vector3;
	values?: number[];
	enterFrom: THREE.Vector3[]; // 새 칩이 날아오는 곳. 비면 제자리에 나타난다.
	exitTo: THREE.Vector3[]; // 빠지는 칩이 날아가는 곳. 비면 바로 사라진다.
	scale?: number;
	model: ChipModel;
};

// 금액 하나를 금액별 칩 더미로 그린다. 금액이 바뀌면 늘어난 칩은 날아오고 줄어든 칩은 날아간다.
function Pile({ id, amount, selected = 0, origin, values, enterFrom, exitTo, scale = 1, model }: PileProps) {
	const [chips, setChips] = useState<Chip[]>([]);

	useEffect(() => {
		// 칩 위치는 origin 기준이다. 날아오고 날아가는 곳도 그 기준으로 바꾼다.
		const local = (point: THREE.Vector3) => point.clone().sub(origin).divideScalar(scale);
		// 고른 금액의 칩은 따로 나눠 각 더미의 맨 위에 올린다
		const rest = toChips(amount - selected, values);
		const list = [...rest, ...toChips(selected, values)];
		const present = CHIP_VALUES.filter((value) => list.includes(value));
		const counts: Record<number, number> = {};
		const wanted = list.map((value, index) => {
			const order = (counts[value] = (counts[value] ?? 0) + 1) - 1;
			const column = present.indexOf(value) - (present.length - 1) / 2;
			const stack = Math.floor(order / STACK_SIZE);
			return {
				key: `${id}-${value}-${order}`,
				value,
				selected: index >= rest.length,
				to: new THREE.Vector3(
					column * 1.2,
					(order % STACK_SIZE) * model.height,
					-stack * 1.1
				),
			};
		});
		const now = Date.now();

		setChips((current) => {
			const staying = new Map(
				current.filter((chip) => !chip.leavingUntil).map((chip) => [chip.key, chip])
			);
			// 빠져나가던 칩과 같은 칩이 다시 필요해지면 빠져나가던 쪽을 지운다 (key 중복 방지)
			const wantedKeys = new Set(wanted.map((want) => want.key));
			const next = current.filter(
				(chip) => chip.leavingUntil && chip.leavingUntil > now && !wantedKeys.has(chip.key)
			);
			let entering = 0;
			wanted.forEach((want) => {
				const chip = staying.get(want.key);
				staying.delete(want.key);
				if (chip)
					next.push(
						chip.to.equals(want.to) && chip.selected === want.selected
							? chip
							: { ...chip, to: want.to, selected: want.selected }
					);
				else if (enterFrom.length)
					next.push({
						...want,
						from: local(enterFrom[entering % enterFrom.length]),
						delay: Math.min(entering++ * 0.04, 0.8),
					});
				else next.push({ ...want, from: want.to, delay: 0 });
			});
			let leaving = 0;
			if (exitTo.length)
				staying.forEach((chip) =>
					next.push({
						...chip,
						to: local(exitTo[leaving++ % exitTo.length]),
						leavingUntil: now + FLY_SECONDS * 1000 + 200,
					})
				);
			return next;
		});

		// 날아간 칩을 지운다
		const timer = setTimeout(
			() => setChips((current) => current.filter((chip) => !chip.leavingUntil || chip.leavingUntil > Date.now())),
			FLY_SECONDS * 1000 + 300
		);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 금액이 바뀔 때만 다시 계산한다
	}, [amount, selected, model.height]);

	return (
		<group position={origin} scale={scale}>
			{chips.map((chip) => (
				<ChipMesh key={chip.key} chip={chip} model={model} />
			))}
		</group>
	);
}

// 테이블 건너편에 앉은 사람. 모델의 앉기 동작 마지막 자세로 굳혀서 그린다.
function Person({ position, color, scale }: { position: THREE.Vector3; color: string; scale: number }) {
	const { scene, animations } = useGLTF(PERSON_URL);
	const height = useMemo(() => new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3()).y, [scene]);
	const person = useMemo(() => {
		const clone = cloneSkinned(scene);
		clone.traverse((object) => {
			const mesh = object as THREE.Mesh;
			if (!mesh.isMesh) return;
			mesh.frustumCulled = false; // 자세를 바꾸면 원래 경계 상자가 맞지 않는다
			const material = mesh.material as THREE.MeshStandardMaterial;
			if (material.name === "Shirt") mesh.material = Object.assign(material.clone(), { color: new THREE.Color(color) });
		});
		const clip = animations.find((animation) => animation.name.endsWith("Man_Sitting"));
		if (clip) {
			const mixer = new THREE.AnimationMixer(clone);
			mixer.clipAction(clip).play();
			mixer.setTime(clip.duration - 0.01);
		}
		return clone;
	}, [scene, animations, color]);

	return (
		<primitive
			object={person}
			scale={(PERSON_HEIGHT / height) * scale}
			position={[position.x, PERSON_Y * scale, position.z]}
			rotation-y={Math.atan2(CENTER.x - position.x, CENTER.z - position.z)}
		/>
	);
}
const PERSON_HEIGHT = 5; // 선 키. 칩 지름이 1 이다.
const PERSON_Y = -2.4; // 앉았을 때 허리가 테이블 높이에 오게 내린다

// 화면 아래에서 테이블 위로 뻗은 내 두 팔. 1인칭 시점이라 몸은 그리지 않는다.
function Arms({ color }: { color: string }) {
	return (
		<>
			{[-1, 1].map((side) => (
				// 화면 아래 모서리에서 칩 쪽으로 비스듬히 뻗는다
				<group key={side} position={[side * 3.1, 0.32, 4.3]} rotation-y={side * 0.55}>
					<mesh rotation-x={Math.PI / 2}>
						<capsuleGeometry args={[0.32, 2.2, 4, 12]} />
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh position={[0, -0.08, -1.6]} scale={[0.36, 0.2, 0.46]}>
						<sphereGeometry args={[1, 16, 12]} />
						<meshStandardMaterial color="#e0ac69" roughness={0.7} />
					</mesh>
				</group>
			))}
		</>
	);
}

// 화면 주인의 자리와 칩. 멀티플레이는 내 자리, 한 기기 모드는 지금 턴인 사람의 자리에서 본다.
function useSeats() {
	const users = useSelector((state: RootState) => state.single.users);
	const turn = useSelector((state: RootState) => state.single.userTurnOrder[0]);
	const mine = useSelector((state: RootState) => state.multi.seat);
	const seat = mine ?? turn ?? 0;
	const me = users[seat] as (typeof users)[number] | undefined;
	// 베팅 대기 금액: 칩 버튼을 눌렀지만 아직 BET 하지 않은 금액
	const behavior = me && turn === seat ? me.currentRoundBehavior : 0;
	const pending =
		typeof behavior === "number"
			? behavior
			: behavior === "ALL-IN"
				? me!.currentScore - me!.currentRoundBet
				: 0;
	const hand = me ? Math.max(0, me.currentScore - me.currentRoundBet) : 0; // 대기 금액을 포함한 내 칩
	return { users, seat, me, pending, hand };
}

function Table() {
	const model = useChipModel();
	const { users, seat, me, pending, hand } = useSeats();
	const total = useSelector((state: RootState) => state.single.currentRoundTotalScore);
	const previous = useRef({ bets: [] as number[], scores: [] as number[], total: 0 });
	const chips = (index: number) => chipsOf(index, seat, users.length);

	// 직전 상태와 견줘 누가 걸었고 누가 땄는지 알아낸다
	const before = previous.current;
	const bets = users.map((user) => user.currentRoundBet);
	const scores = users.map((user) => user.currentScore);
	const all = users.map((_, index) => index);
	const bettors = all.filter((index) => bets[index] > (before.bets[index] ?? 0));
	// 팟이 줄면서 점수가 오른 사람이 승자다. 팟이 그대로면 충전이라 칩이 제자리에 생긴다.
	const winners = all.filter(
		(index) => total < before.total && scores[index] > (before.scores[index] ?? Infinity)
	);
	useEffect(() => {
		previous.current = { bets, scores, total };
	});

	return (
		<>
			<Pile
				id="pot"
				amount={total}
				origin={POT}
				// 건 사람 앞의 칩 자리에서 날아온다
				enterFrom={(bettors.length ? bettors : all).map(chips)}
				// 팟은 사라지고, 승자 앞의 칩 더미가 팟에서 날아온다
				exitTo={[]}
				model={model}
			/>
			{me && (
				<>
					<Arms color={SHIRTS[seat % SHIRTS.length]} />
					<Pile
						id="hand"
						amount={hand}
						selected={pending}
						origin={HAND}
						values={HAND_VALUES}
						enterFrom={winners.includes(seat) ? [POT] : []}
						exitTo={[]}
						scale={0.7}
						model={model}
					/>
				</>
			)}
			{users.map(
				(user, index) =>
					index !== seat && (
						<React.Fragment key={index}>
							<Person position={seatOf(index, seat, users.length)} color={SHIRTS[index % SHIRTS.length]} scale={personScale(users.length)} />
							{/* 남은 금액은 그 사람 앞의 칩으로 보여 준다 */}
							<Pile
								id={`user${index}`}
								amount={Math.max(0, user.currentScore - user.currentRoundBet)}
								origin={chips(index)}
								values={HAND_VALUES}
								enterFrom={winners.includes(index) ? [POT] : []}
								exitTo={[]}
								scale={0.55}
								model={model}
							/>
						</React.Fragment>
					)
			)}
		</>
	);
}

// 테이블 가로·세로가 화면 비율과 상관없이 다 보이게 카메라 거리를 맞춘다
function Camera({ onView }: { onView: (view: { camera: THREE.Camera }) => void }) {
	const { width, height, target, tilt } = VIEW;
	const { camera, size } = useThree();
	useEffect(() => {
		const perUnit = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // 거리 1당 보이는 세로 길이
		const distance = Math.max(height / perUnit, width / (perUnit * (size.width / size.height)));
		// tilt: 테이블을 내려다보는 각도(도). 작을수록 자리에 앉아서 보는 눈높이에 가깝다.
		const angle = THREE.MathUtils.degToRad(tilt);
		camera.position.set(target.x, target.y + distance * Math.sin(angle), target.z + distance * Math.cos(angle));
		camera.lookAt(target);
		camera.updateMatrixWorld();
		onView({ camera }); // 화면 위 글자를 3D 자리에 맞추는 데 쓴다
	}, [camera, size, width, height, target, tilt, onView]);
	return null;
}

// 내 자리에 앉아 테이블 건너편 사람들을 보는 1인칭 시점
// 낮은 각도와 넓은 화각으로 테이블이 납작하고 넓어 보인다
const FOV = 62;
// 테이블 옆과 앞은 화면 밖으로 잘린다. 가까운 곳일수록 보이는 폭이 좁아 내 칩은 가운데에 모은다.
const VIEW = { width: 8.4, height: 5, target: new THREE.Vector3(0, 0.5, 1.2), tilt: 15 };

// 타원 테이블 - 앞쪽은 화면 아래로 잘려 내가 테이블에 앉은 것처럼 보인다
const Felt = () => (
	<group position={[0, -0.02, 0.9]} rotation-x={-Math.PI / 2} scale={[5.3, 4.5, 1]}>
		<mesh>
			<circleGeometry args={[1, 64]} />
			<meshStandardMaterial color="#2f7a4f" roughness={0.9} />
		</mesh>
		<mesh position-z={-0.001}>
			<circleGeometry args={[1.07, 64]} />
			<meshStandardMaterial color="#4a2f1a" roughness={0.6} />
		</mesh>
	</group>
);

// 1인칭 포커 테이블. 둘러앉은 사람들, 공용 팟, 내 베팅 대기 칩과 내 칩을 그린다.
export default function BetTable3D({ className }: { className?: string }) {
	const { users, seat, me } = useSeats();
	const [view, setView] = useState<{ camera: THREE.Camera } | null>(null);

	// 3D 자리 위에 글자를 얹는다
	const pin = (key: React.Key, position: THREE.Vector3, children: React.ReactNode) => {
		if (!view) return null;
		const point = position.clone().project(view.camera);
		return (
			<div
				key={key}
				className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
				style={{ left: `${(point.x + 1) * 50}%`, top: `${(1 - point.y) * 50}%` }}
			>
				{children}
			</div>
		);
	};

	return (
		<div className={`relative overflow-hidden ${className ?? ""}`}>
			<Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: FOV }}>
				<Camera onView={setView} />
				<ambientLight intensity={1.1} />
				<directionalLight position={[3, 8, 5]} intensity={1.8} />
				<Felt />
				<Suspense fallback={null}>
					<Table />
				</Suspense>
				<ContactShadows opacity={0.5} scale={12} blur={2} far={4} />
			</Canvas>
			{me && (
				<>
					{users.map(
						(user, index) =>
							index !== seat &&
							pin(
								index,
								seatOf(index, seat, users.length).setY(2.1 * personScale(users.length)), // 머리 위
								<UserCard compact user={user} />
							)
					)}
				</>
			)}
		</div>
	);
}

useGLTF.preload(MODEL_URL);
useGLTF.preload(PERSON_URL);
