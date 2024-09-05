import { Modal } from "antd";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleResultModal({ isModalOpen, setIsModalOpen, }: Props) {
    const navigate = useNavigate();

    const users = useSelector((state: RootState) => state.single.users);

    const handleExitClick = () => {
        // 복사할 텍스트 생성
        const copiedText = users.map(user => {
            const scoreDifference = user.currentScore - user.initialScore;
            return `${user.name}: ${scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference}`;
        }).join('\n'); // 각 사용자 정보를 줄바꿈으로 연결

        // 클립보드에 복사
        navigator.clipboard.writeText(copiedText).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        }).catch(err => {
            console.error('복사 실패: ', err);
        });

        // '/single' 페이지로 이동
        navigate('/single');
    }

    return (
        <Modal title="Game Result" width="500px" okText="Exit" onOk={handleExitClick} open={isModalOpen} cancelText='Cancel' onCancel={() => setIsModalOpen(false)}>
            <div className="flex flex-col gap-4">
                {users.map((user) => {
                    const scoreDifference = user.currentScore - user.initialScore;
                    const scoreClass = scoreDifference > 0 ? 'text-red-500' : 'text-blue-500';

                    return (
                        <p key={user.name} className={scoreClass}>
                            {user.name} : {scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference}
                        </p>
                    );
                })}
            </div>
        </Modal>
    )
}