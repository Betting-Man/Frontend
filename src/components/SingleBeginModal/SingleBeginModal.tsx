import React from "react";
import { useNavigate } from 'react-router-dom';
import UserNameInput from "../UserNameInput/UserNameInput";
import { useSelector, useDispatch } from 'react-redux';
import { checkNameRedundancy, startGame } from "../../features/single/singleSlice";
import { RootState } from "../../app/store";
import GameDialog from "../GameDialog/GameDialog";

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

    const leftUsers: number = Math.ceil(userCount / 2);
    const rightUsers: number = Math.floor(userCount / 2);
    const userNames = useSelector((state: RootState) => state.single.userNames)
    const userNamesExample = ["Sean", "Tom", "Liam", "John", "James", "Mia", "Bob", "Amelia"];
    const hasDuplicateName = useSelector((state: RootState) => state.single.hasDuplicateName) // 이름 중복 여부

    const handleOk = () => {
        dispatch(checkNameRedundancy());
        if (!hasDuplicateName) {
            // 이전 게임에서 남은 이름이 섞이지 않게 인원 수만큼만 쓴다
            startGame(dispatch, userNames.slice(0, userCount), initialScore, initialBet);
            navigate('/single/1'); // 한 기기 모드의 고정 roomId
        }
    }

    return (
        <GameDialog title="Setting For Player Name" okText={hasDuplicateName ? 'Duplicate Check' : 'Start'} open={isModalOpen} onOk={handleOk} onClose={() => setIsModalOpen(false)}>
            <div className='flex gap-4 py-3'>
                <div className="flex flex-col w-1/2 gap-4">
                    {[...Array(leftUsers)].map((_, index) => (
                        <UserNameInput key={index} user={userNamesExample[index * 2]} index={index * 2} isLeft={true} />
                    ))}
                </div>
                <div className='flex flex-col w-1/2 gap-4'>
                    {[...Array(rightUsers)].map((_, index) => (
                        <UserNameInput key={index} user={userNamesExample[index * 2 + 1]} index={index * 2 + 1} isLeft={false} />
                    ))}
                </div>
            </div>
        </GameDialog>
    )
}
