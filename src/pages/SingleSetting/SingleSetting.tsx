import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SingleBeginModal from "../../components/SingleBeginModal/SingleBeginModal";
import { leaveRoom } from "../../features/multi/room";

// 시작 금액 배열
const initialScoreOptions = Array.from({ length: 10 }, (_, index) => 5000 * (index + 1));
// 라운드 시작시마다 무조건 내는 금액 배열
const initialBetOptions = Array.from({ length: 10 }, (_, index) => 50 * (index + 1));
const userCountOptions = [2, 3, 4, 5, 6, 7, 8];

type NumberSelectProps = { value: number, options: number[], onChange: (value: number) => void, disabled?: boolean }

function NumberSelect({ value, options, onChange, disabled }: NumberSelectProps) {
    return (
        <Select value={String(value)} onValueChange={(next) => onChange(Number(next))} disabled={disabled}>
            <SelectTrigger className="h-11 w-40 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
                {options.map((option) => <SelectItem key={option} value={String(option)}>{option}</SelectItem>)}
            </SelectContent>
        </Select>
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
            <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-semibold">total Score</p>
                <NumberSelect value={initialScore} options={initialScoreOptions} onChange={setInitialScore} />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-semibold">Initial Bet</p>
                <label className="flex items-center gap-2 py-1">
                    <Checkbox checked={isInitialBet} onCheckedChange={(checked) => setIsInitialBet(checked === true)} />
                    Use Initial Bet
                </label>
                <NumberSelect value={initialBet} options={initialBetOptions} onChange={setInitialBet} disabled={!isInitialBet} />
            </div>
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='h-full flex items-center justify-center '>
            <div className='flex flex-col items-center gap-4'>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-3xl font-semibold">number of users</p>
                    <NumberSelect value={numberOfUser} options={userCountOptions} onChange={setNumberOfUser} />
                </div>
                <ScoreSettingFields onChange={setSetting} />

                <Button size="lg" className="h-11" onClick={() => setIsModalOpen(true)}>Start</Button>
                {isModalOpen && <SingleBeginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userCount={numberOfUser} initialBet={setting.initialBet} initialScore={setting.initialScore} />}
            </div>
        </motion.div>

    )
}
