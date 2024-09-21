import React, { useState } from 'react'
import { Button } from "antd";
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import SingleWinnerModal from '../SingleWinnerModal/SingleWinnerModal';

export default function ScoreBoard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 라운드 걸린 베팅 금액
    const roundScore = useSelector((state: RootState) => state.single.currentRoundTotalScore);
    // 콜에 필요한 금액
    const requiredCallScore = useSelector((state: RootState) => state.single.requiredCallScore);

    return (
        <div id='score_board' className="p-2 flex items-center">
            <div className='flex-grow flex flex-col items-center'>
                <h1 className='text-2xl text-white sm:text-3xl'>Round Score : {roundScore}</h1>
                <h1 className='text-lg text-gray-300 sm:text-xl'>The Calling Amount : {requiredCallScore}</h1>
            </div>

            <Button type="primary" className="ml-auto" onClick={() => setIsModalOpen(true)}>Win</Button>
            {isModalOpen && <SingleWinnerModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
        </div>
    )
}