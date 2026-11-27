import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "../../app/store";
import { CHIP_COLORS, CHIP_VALUES, toChips } from "../../features/single/chips";

const MODEL_URL = "/models/poker-chip.glb";
const STACK_SIZE = 10; // 한 더미에 쌓는 칩 수
const FLY_SECONDS = 0.6;

type Chip = {
	key: string;
	value: number;
	from: THREE.Vector3;
	to: THREE.Vector3;
	delay: number; // 여러 칩이 차례로 날아가게 하는 지연(초)
	leavingUntil?: number; // 팟에서 빠져나가는 칩을 지울 시각(ms)
};

// 유저 자리 - UserTable 과 같이 짝수 인덱스는 왼쪽, 홀수는 오른쪽
const seatPosition = (index: number, userCount: number) => {
	const rows = Math.ceil(userCount / 2);
	const row = Math.floor(index / 2);
	return new THREE.Vector3(index % 2 === 0 ? -7 : 7, 0.5, (row - (rows - 1) / 2) * 0.9);
};

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
		</group>
	);
}

function Chips() {
	const model = useChipModel();
	const users = useSelector((state: RootState) => state.single.users);
	const round = useSelector((state: RootState) => state.single.round);
	const total = useSelector((state: RootState) => state.single.currentRoundTotalScore);
	const turn = useSelector((state: RootState) => state.single.userTurnOrder[0]);
	const [chips, setChips] = useState<Chip[]>([]);
	const previous = useRef({ round, bets: [] as number[] });

	useEffect(() => {
		// 팟 금액을 금액별 칩 더미 위치로 바꾼다
		const values = toChips(total);
		const present = CHIP_VALUES.filter((value) => values.includes(value));
		const counts: Record<number, number> = {};
		const wanted = values.map((value) => {
			const order = (counts[value] = (counts[value] ?? 0) + 1) - 1;
			const column = present.indexOf(value) - (present.length - 1) / 2;
			const stack = Math.floor(order / STACK_SIZE);
			return {
				key: `${round}-${value}-${order}`,
				value,
				to: new THREE.Vector3(
					column * 1.2,
					(order % STACK_SIZE) * model.height,
					-stack * 1.1
				),
			};
		});

		// 이번에 베팅액이 늘어난 유저 자리에서 칩이 날아온다
		const bets = users.map((user) => user.currentRoundBet);
		const before = previous.current.round === round ? previous.current.bets : [];
		const sources = bets.flatMap((bet, index) => (bet > (before[index] ?? 0) ? [index] : []));
		previous.current = { round, bets };
		// 팟에서 빠지는 칩은 다음 라운드 첫 턴(= 승자) 자리로 날아간다
		const exit = seatPosition(turn ?? 0, users.length);
		const now = Date.now();

		setChips((current) => {
			const staying = new Map(
				current.filter((chip) => !chip.leavingUntil).map((chip) => [chip.key, chip])
			);
			const next = current.filter((chip) => chip.leavingUntil && chip.leavingUntil > now);
			let entering = 0;
			wanted.forEach((want) => {
				const chip = staying.get(want.key);
				staying.delete(want.key);
				if (chip) next.push(chip.to.equals(want.to) ? chip : { ...chip, to: want.to });
				else {
					const source = sources.length ? sources[entering % sources.length] : (turn ?? 0);
					next.push({
						...want,
						from: seatPosition(source, users.length),
						delay: Math.min(entering++ * 0.04, 0.8),
					});
				}
			});
			staying.forEach((chip) =>
				next.push({ ...chip, to: exit, leavingUntil: now + FLY_SECONDS * 1000 + 200 })
			);
			return next;
		});

		// 날아간 칩을 지운다
		const timer = setTimeout(
			() => setChips((current) => current.filter((chip) => !chip.leavingUntil || chip.leavingUntil > Date.now())),
			FLY_SECONDS * 1000 + 300
		);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 팟 금액과 라운드가 바뀔 때만 다시 계산한다
	}, [round, total, model.height]);

	return (
		<>
			{chips.map((chip) => (
				<ChipMesh key={chip.key} chip={chip} model={model} />
			))}
		</>
	);
}

// 칩 더미 5줄(가로 6.2)과 한 더미 높이(세로 3.2)가 화면 비율과 상관없이 다 보이게 카메라 거리를 맞춘다
function Camera() {
	const { camera, size } = useThree();
	useEffect(() => {
		const perUnit = 2 * Math.tan(THREE.MathUtils.degToRad(15)); // fov 30 에서 거리 1당 보이는 세로 길이
		const distance = Math.max(3.2 / perUnit, 6.2 / (perUnit * (size.width / size.height)));
		camera.position.set(0, 0.5 + distance * 0.55, distance * 0.835);
		camera.lookAt(0, 0.5, 0);
	}, [camera, size]);
	return null;
}

// 팟에 걸린 금액을 3D 포커칩 더미로 보여 준다
export default function BetTable3D({ className }: { className?: string }) {
	return (
		<div className={className} aria-hidden>
			<Canvas
				frameloop="demand"
				dpr={[1, 2]}
				camera={{ fov: 30 }}
			>
				<Camera />
				<ambientLight intensity={1.1} />
				<directionalLight position={[3, 8, 5]} intensity={1.8} />
				<Suspense fallback={null}>
					<Chips />
				</Suspense>
				<ContactShadows opacity={0.5} scale={12} blur={2} far={4} />
			</Canvas>
		</div>
	);
}

useGLTF.preload(MODEL_URL);
