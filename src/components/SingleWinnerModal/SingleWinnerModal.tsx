import { Modal } from "antd";
import React, { useState } from "react";
import { useDispatch,useSelector } from 'react-redux';
import { incrementRound,resetRequiredCallScore,divideRoundScoreToWinner, setInitialRoundSetting, resetAllUserCurrentRoundBehavior } from '../../features/single/singleSlice';
import { RootState } from "../../app/store";
import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

    const handleCancel = () => {
        setIsModalOpen(false);
    }

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
        <Modal title="Select Winner" open={isModalOpen} okText='Select' onOk={handleOk} onCancel={handleCancel}>
    <div className="grid grid-cols-2 gap-4">
        {users.map((user, index) => (
            <div
            key={index}
            className={`flex items-center p-4 border cursor-pointer ${
                selectedUserIndexes.includes(index) ? 'bg-blue-200' : 'bg-white'
            }`}
            onClick={() => handleClick(index)}
        >
            <FontAwesomeIcon icon={faUser} size="2xl" className="mr-2" />
            <p>{user.name}</p>
        </div>
        ))}
    </div>
</Modal>
    )
}