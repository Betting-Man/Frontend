import { Modal } from "antd";
import React from "react";
import { useDispatch } from 'react-redux';
import { incrementRound,resetCurrentRoundTotalScore } from '../../features/single/singleSlice';

type Props = { isModalOpen: boolean, setIsModalOpen: (isOpen: boolean) => void, }

export default function SingleWinnerModal({ isModalOpen,setIsModalOpen }: Props) {
    const dispatch = useDispatch();

    const handleOk = () => {
        setIsModalOpen(false);
        dispatch(incrementRound()); // 라운드 수 증가
        // 이긴 유저에 score 나눠주기
        dispatch(resetCurrentRoundTotalScore()); // roundScore 초기화
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    return (
        <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </Modal>
    )
}