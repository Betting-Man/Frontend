import React, { useState } from 'react';
import { Modal } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { incrementUserScore } from '../../features/single/singleSlice';

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

    return (
        <Modal title="Recharge Score" width="500px" okText="Recharge" onOk={handleOk} open={isModalOpen} cancelText='Cancel' onCancel={handleCancel}>
            <p className='my-3 flex justify-center text-xl'>Charge Amount : {initialScore}</p>
            <div className="grid grid-cols-2 gap-4">
                {users.map((user, index) => (
                    <div
                        key={index}
                        className={`flex items-center p-4 border cursor-pointer ${selectedUserIndexes.includes(index) ? 'bg-blue-200' : 'bg-white'
                            }`}
                        onClick={() => handleClick(index)}
                    >
                        <FontAwesomeIcon icon={faUser} size="2xl" className="mr-2" />
                        <div className='flex flex-col items-center'>
                            <p>{user.name}</p>
                            <p>{user.currentScore}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    )
}