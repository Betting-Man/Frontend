import React, { useState } from 'react';
import { User as UserIcon } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import { MAX_CHARGE, incrementUserScore } from '../../features/single/singleSlice';
import { Stepper } from '../../pages/SingleSetting/SingleSetting';
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

// 충전 금액 선택지 - 1000 단위
const amountOptions = Array.from({ length: MAX_CHARGE / 1000 }, (_, index) => 1000 * (index + 1));

export default function SingleChargeModal({ isModalOpen, setIsModalOpen }: Props) {

    const dispatch = useDispatch();
    const [selectedUserIndexes, setSelectedUserIndexes] = useState<number[]>([]);

    const users = useSelector((state: RootState) => state.single.users);
    const initialScore = useSelector((state: RootState) => state.single.initialScore);
    // 멀티플레이에서는 자기 돈만 충전한다. 한 기기 모드(seat 없음)에서는 누구든 고른다.
    const seat = useSelector((state: RootState) => state.multi.seat);
    const [amount, setAmount] = useState(amountOptions.includes(initialScore) ? initialScore : 5000);

    const handleOk = () => {
        const indexes = seat === null ? selectedUserIndexes : [seat];
        if (indexes.length > 0) {
            dispatch(incrementUserScore({ indexes, amount }));
            setSelectedUserIndexes([]);
            setIsModalOpen(false);
        }
    };

    const handleClick = (index: number) => {
        if (selectedUserIndexes.includes(index)) {
            // 이미 선택된 인덱스라면 배열에서 제거
            setSelectedUserIndexes(selectedUserIndexes.filter((i) => i !== index));
        } else {
            // 선택되지 않은 인덱스라면 배열에 추가
            setSelectedUserIndexes([...selectedUserIndexes, index]);
        }
    };

    return (
        <GameDialog title="Recharge Score" okText="Recharge" onOk={handleOk} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="my-3">
                <Stepper label="Amount" value={amount} options={amountOptions} onChange={setAmount} />
            </div>
            {seat !== null ? (
                <p className="text-center text-sm text-muted-foreground">
                    {users[seat]?.name}: {users[seat]?.currentScore} → {(users[seat]?.currentScore ?? 0) + amount}
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {users.map((user, index) => (
                        <button
                            key={index}
                            aria-pressed={selectedUserIndexes.includes(index)}
                            className={`flex cursor-pointer items-center rounded-md border p-4 transition-colors ${
                                selectedUserIndexes.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                            onClick={() => handleClick(index)}
                        >
                            <UserIcon className="mr-2 size-8" />
                            <div className='flex flex-col items-center'>
                                <p>{user.name}</p>
                                <p>{user.currentScore}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </GameDialog>
    )
}
