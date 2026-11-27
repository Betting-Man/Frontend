import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import SingleBeginModal from "../../components/SingleBeginModal/SingleBeginModal";
import { leaveRoom } from "../../features/multi/room";

// 시작 금액 배열
const initialScoreOptions = Array.from({ length: 10 }, (_, index) => 5000 * (index + 1));
// 라운드 시작시마다 무조건 내는 금액 배열
const initialBetOptions = Array.from({ length: 10 }, (_, index) => 50 * (index + 1));
const userCountOptions = [2, 3, 4, 5, 6, 7, 8];

type StepperProps = { label: React.ReactNode, value: number, options: number[], onChange: (value: number) => void, disabled?: boolean }

// 라벨과 −/+ 조절기 한 줄. 드롭다운과 달리 한 번 탭으로 값을 바꾼다.
export function Stepper({ label, value, options, onChange, disabled }: StepperProps) {
    const index = options.indexOf(value);
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Decrease" disabled={disabled || index <= 0} onClick={() => onChange(options[index - 1])}><Minus /></Button>
                <p className={`w-16 text-center text-xl font-bold tabular-nums ${disabled ? 'opacity-40' : ''}`}>{value}</p>
                <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Increase" disabled={disabled || index >= options.length - 1} onClick={() => onChange(options[index + 1])}><Plus /></Button>
            </div>
        </div>
    )
}

export type ScoreSetting = { initialScore: number, initialBet: number }

// 시작 금액과 초기 베팅 입력 - 한 기기 모드와 방 만들기가 함께 쓴다
export function ScoreSettingFields({ onChange }: { onChange: (setting: ScoreSetting) => void }) {
    const [isInitialBet, setIsInitialBet] = useState(true); // 초기 베팅 여부
    const [initialScore, setInitialScore] = useState(5000); // 초기 금액
    const [initialBet, setInitialBet] = useState(50); // 초기 베팅 금액

    useEffect(() => {
        onChange({ initialScore, initialBet: isInitialBet ? initialBet : 0 });
    }, [onChange, initialScore, initialBet, isInitialBet]);

    return (
        <>
            <Stepper label="Starting Chips" value={initialScore} options={initialScoreOptions} onChange={setInitialScore} />
            <Stepper
                label={
                    <label className="flex items-center gap-2 py-2">
                        <Checkbox checked={isInitialBet} onCheckedChange={(checked) => setIsInitialBet(checked === true)} />
                        Initial Bet
                    </label>
                }
                value={initialBet} options={initialBetOptions} onChange={setInitialBet} disabled={!isInitialBet}
            />
        </>
    )
}

export default function Single() {
    const [isModalOpen, setIsModalOpen] = useState(false); // 유저 닉네임 짓는 모달창 오픈 여부
    const [numberOfUser, setNumberOfUser] = useState(2); // 참여하는 유저 수
    const [setting, setSetting] = useState<ScoreSetting>({ initialScore: 5000, initialBet: 50 });

    // 한 기기 모드로 들어오면 멀티플레이 방을 떠난다
    useEffect(() => leaveRoom(), []);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            <div className="flex w-full max-w-xs flex-col gap-4">
                <h1 className="text-2xl font-semibold">Single Device</h1>
                <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
                    <Stepper label="Players" value={numberOfUser} options={userCountOptions} onChange={setNumberOfUser} />
                    <ScoreSettingFields onChange={setSetting} />
                </div>
                <Button size="lg" className="h-12 w-full" onClick={() => setIsModalOpen(true)}>Next</Button>
                {isModalOpen && <SingleBeginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userCount={numberOfUser} initialBet={setting.initialBet} initialScore={setting.initialScore} />}
            </div>
        </motion.div>
    )
}
