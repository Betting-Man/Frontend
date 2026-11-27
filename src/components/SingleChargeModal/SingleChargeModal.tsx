import React, { useState } from 'react';
import { User as UserIcon } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import { incrementUserScore } from '../../features/single/singleSlice';
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleChargeModal({ isModalOpen, setIsModalOpen }: Props) {

    const dispatch = useDispatch();
    const [selectedUserIndexes, setSelectedUserIndexes] = useState<number[]>([]);

    const users = useSelector((state: RootState) => state.single.users);
    const initialScore = useSelector((state: RootState) => state.single.initialScore);

    const handleOk = () => {
        if (selectedUserIndexes.length > 0) {
            dispatch(incrementUserScore(selectedUserIndexes));
            setSelectedUserIndexes([]);
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
            <p className='my-3 flex justify-center text-xl'>Charge Amount : {initialScore}</p>
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
        </GameDialog>
    )
}
