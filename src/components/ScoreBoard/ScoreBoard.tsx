import React, { useState } from 'react'
import { Button, Modal } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { incrementRound } from '../../features/single/singleSlice';
import SingleWinnerModal from '../SingleWinnerModal/SingleWinnerModal';

type Props = {}

export default function ScoreBoard({ }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 라운드 걸린 베팅 금액
    const roundScore = useSelector((state: RootState) => state.single.currentRoundTotalScore);
    // 콜에 필요한 금액
    const requiredCallScore = useSelector((state: RootState) => state.single.requiredCallScore);

    return (
        <div className="p-2 flex items-center">
    <div className='flex-grow flex flex-col items-center'>
        <h1 className='text-3xl text-white'>Round Score : {roundScore}</h1>
        <h1 className='text-xl text-gray-300'>The Calling Amount : {requiredCallScore}</h1>
    </div>

    <Button type="primary" className="ml-auto" onClick={() => setIsModalOpen(true)}>Win</Button>
    {isModalOpen && <SingleWinnerModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
</div>
    )
}