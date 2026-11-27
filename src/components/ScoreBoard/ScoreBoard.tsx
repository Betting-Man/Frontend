import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { RootState } from '../../app/store';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';
import SingleWinnerModal from '../SingleWinnerModal/SingleWinnerModal';

export default function ScoreBoard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 라운드 걸린 베팅 금액
    const roundScore = useSelector((state: RootState) => state.single.currentRoundTotalScore);
    // 콜에 필요한 금액
    const requiredCallScore = useSelector((state: RootState) => state.single.requiredCallScore);
    // 승자 선택은 참가자에게 보이지 않는다
    const isGuest = useSelector((state: RootState) => state.multi.role === 'guest');

    return (
        <div id='score_board' className="p-2 flex items-center">
            <div className='flex-grow flex flex-col items-center'>
                <h1 className='text-2xl sm:text-3xl'>팟 <b><AnimatedNumber value={roundScore} /></b></h1>
                <h1 className='text-lg text-muted-foreground sm:text-xl'>콜 금액 <AnimatedNumber value={requiredCallScore} /></h1>
            </div>

            {!isGuest && <Button className="ml-auto" onClick={() => setIsModalOpen(true)}>승자 선택</Button>}
            {isModalOpen && <SingleWinnerModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
        </div>
    )
}
