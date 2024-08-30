import React from 'react'
import { Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';

type Props = {}

export default function ScoreBoard({ }: Props) {
    // 라운드 걸린 베팅 금액
    const roundScore = useSelector((state : RootState) => state.single.currentRoundTotalScore);

    return (
        <div className="p-2 flex justify-center items-center">
            <h1>Round Score : {roundScore}</h1>
            <Button type="primary">Win</Button>
        </div>
    )
}