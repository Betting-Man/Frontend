import React from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleResultModal({ isModalOpen, setIsModalOpen, }: Props) {
    const navigate = useNavigate();

    const users = useSelector((state: RootState) => state.single.users);
    const isLocal = useSelector((state: RootState) => state.multi.role === 'local');

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

        // 한 기기 모드는 설정 화면으로, 멀티플레이는 홈으로 나간다 (홈에서 방을 떠난다)
        navigate(isLocal ? '/single' : '/');
    }

    return (
        <GameDialog title="Game Result" okText="Exit" onOk={handleExitClick} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col gap-4">
                {users.map((user) => {
                    const scoreDifference = user.currentScore - user.initialScore;
                    const scoreClass = scoreDifference > 0 ? 'text-red-400' : 'text-blue-300';

                    return (
                        <p key={user.name} className={scoreClass}>
                            {user.name} : {scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference}
                        </p>
                    );
                })}
            </div>
        </GameDialog>
    )
}
