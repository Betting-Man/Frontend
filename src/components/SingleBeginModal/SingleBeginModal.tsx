import { Select, Checkbox, Button, Modal, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useUserposition from "../../hooks/useUserPostition";
import UserNameInput from "../UserNameInput/UserNameInput";
import { useSelector, useDispatch } from 'react-redux';
import { setUserCount, setUsers, setInitialBet, setUserTurnOrder } from "../../features/single/singleSlice";
import { RootState } from "../../app/store";
import { User } from "../../features/single/singleSlice";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
    userCount: number,
    initialBet: number,
    initialScore: number,
}

export default function SingleBeginModal({ isModalOpen, setIsModalOpen, userCount, initialBet, initialScore }: Props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // const { leftArray, rightArray } = useUserposition(userCount);
    const leftUsers: number = Math.ceil(userCount / 2);
    const rightUsers: number = Math.floor(userCount / 2);
    const userNames = useSelector((state : RootState) => state.single.userNames)

    const handleOk = () => {
        dispatch(setInitialBet(initialBet)) // 초기 베팅 금액 상태 업데이트
        // 유저 객체 배열 생성
        const userObjects: User[] = [];

        userNames.forEach((name)=>{
            userObjects.push({
                name: name,
                initialScore: initialScore,
                currentScore: initialScore,
                isTurn : false,
                currentRoundBet : 0,
                currentRoundBehavior : '',
                isDie : false
            })
        })

        dispatch(setUsers(userObjects)) // 유저 객체 업데이트
        dispatch(setUserTurnOrder()); // 턴 정하기
        navigate('/single/1'); // 특정 roomId로 수정 필요 ////////////////////////////////////////
    }

    return (
        <Modal title="시작 전 세팅" width="500px" okText="Start" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
            <div className='p-3 flex'>
                <div className="flex flex-col w-1/2 gap-4">
                    {[...Array(leftUsers)].map((_, index) => (
                        <UserNameInput key={index} user={`User${(index+1) * 2 - 1}`} index={index*2} isLeft={true}/>
                    ))}
                </div>
                <div className='flex flex-col w-1/2 gap-4'>
                {[...Array(rightUsers)].map((_, index) => (
                        <UserNameInput key={index} user={`User${(index+1) * 2}`} index={index*2 + 1} isLeft={false}/>
                    ))}
                </div>
            </div>
        </Modal>
    )
}