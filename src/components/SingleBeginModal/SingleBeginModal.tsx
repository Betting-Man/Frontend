import { Select, Checkbox, Button, Modal, Input } from "antd";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useUserposition from "../../hooks/useUserPostition";
import LeftUserNameInput from "../UserNameInput/LeftUserNameInput";
import RightUserNameInput from "../UserNameInput/RightUserNameInput";
import { useSelector, useDispatch } from 'react-redux';
import { setUserCount, setUsers, setInitialBet } from "../../features/single/singleSlice";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
    userCount: number,
    initialBet: number,
    initialScore: number,
}

type User = {
    name: string,
    initialScore: number,
    currentScore: number,
}

export default function SingleBeginModal({ isModalOpen, setIsModalOpen, userCount, initialBet, initialScore }: Props) {
    const { leftArray, rightArray } = useUserposition(userCount);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleOk = () => {
        navigate('/single/1'); // 특정 roomId로 수정 필요 ////////////////////////////////////////
        dispatch(setUserCount(userCount)) // 유저 수 상태 업데이트
        dispatch(setInitialBet(initialBet)) // 초기 베팅 금액 상태 업데이트
        // 유저 객체 배열 생성
        const userObjects: User[] = [];
        // leftArray 첫번째 요소로 객체 생성
        if (leftArray.length > 0) {
            userObjects.push({
                name: leftArray[0],
                initialScore: 0,
                currentScore: 0,
            });
        }
        // rightArray의 모든 요소로 객체 생성
        rightArray.forEach((userName) => {
            userObjects.push({
                name: userName,
                initialScore: 0,
                currentScore: 0,
            });
        });
        // leftArray의 나머지 요소로 객체 생성
        for (let i = 1; i < leftArray.length; i++) {
            userObjects.push({
                name: leftArray[i],
                initialScore: 0,
                currentScore: 0,
            });
        }
        dispatch(setUsers(userObjects)) // 유저 객체 업데이트
    }

    return (
        <Modal title="시작 전 세팅" width="500px" okText="Start" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
            <div className='p-3 flex'>
                <div className="flex flex-col w-1/2 gap-4">
                    {leftArray.map((user, index) => (
                        <LeftUserNameInput key={index} user={user} />
                    ))}
                </div>
                <div className='flex flex-col w-1/2 gap-4'>
                    {rightArray.map((user, index) => (
                        <RightUserNameInput key={index} user={user} />
                    ))}
                </div>
            </div>
        </Modal>
    )
}