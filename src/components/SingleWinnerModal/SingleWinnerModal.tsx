import React, { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { useDispatch,useSelector } from 'react-redux';
import { incrementRound,resetRequiredCallScore,divideRoundScoreToWinner, setInitialRoundSetting, resetAllUserCurrentRoundBehavior } from '../../features/single/singleSlice';
import { RootState } from "../../app/store";
import GameDialog from "../GameDialog/GameDialog";

type Props = { isModalOpen: boolean, setIsModalOpen: (isOpen: boolean) => void, }

export default function SingleWinnerModal({ isModalOpen,setIsModalOpen }: Props) {
    const dispatch = useDispatch();
    const [selectedUserIndexes, setSelectedUserIndexes] = useState<number[]>([]);

    const handleOk = () => {
        setIsModalOpen(false);
        if(selectedUserIndexes.length>0){
            dispatch(divideRoundScoreToWinner(selectedUserIndexes)); // 이긴 유저에 score 나눠주기
            dispatch(resetRequiredCallScore()); // requiredCallScore 초기화
            dispatch(setInitialRoundSetting()); // inital Bet을 통해 round 시작전 세팅
            dispatch(resetAllUserCurrentRoundBehavior()); // 모든 유저 currentBehavior 초기화
            dispatch(incrementRound()); // 라운드 수 증가
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

    const users=useSelector((state : RootState) => state.single.users);

    return (
        <GameDialog title="Select Winner" open={isModalOpen} okText='Select' onOk={handleOk} onClose={() => setIsModalOpen(false)}>
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
                        <p>{user.name}</p>
                    </button>
                ))}
            </div>
        </GameDialog>
    )
}
