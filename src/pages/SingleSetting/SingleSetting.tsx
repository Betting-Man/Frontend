import { Select, Checkbox, Button, Modal, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import RightUserNameInput from "../../components/UserNameInput/UserNameInput";
import useUserposition from "../../hooks/useUserPostition";
import SingleBeginModal from "../../components/SingleBeginModal/SingleBeginModal";


type Props = {}

export default function Single({ }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false); // 유저 닉네임 짓는 모달창 오픈 여부
    const [isInitialBet, setIsInitialBet] = useState(true); // 초기 베팅 여부
    const [numberOfUser, setNumberOfUser] = useState(2); // 참여하는 유저 수
    const [initialScore, setInitialScore] = useState(5000); // 초기 금액
    const [initialBet, setInitialBet] = useState(50); // 초기 베팅 금액

    const navigate = useNavigate();

    // 시작 금액 배열
    const initialScoreOptions = Array.from({ length: 10 }, (_, index) => {
        const value = 5000 * (index + 1);
        return { value, label: `${value}` };
    });
    // 라운드 시작시마다 무조건 내는 금액 배열
    const initialBetOptions = Array.from({ length: 10 }, (_, index) => {
        const value = 50 * (index + 1);
        return { value, label: `${value}` };
    });


    return (
        <div className='h-full flex items-center justify-center '>
            <div className='flex flex-col items-center gap-4'>
                <div className="flex flex-col items-center">
                    <p className="text-3xl text-white  font-semibold">number of users</p>
                    <Select
                        defaultValue='2'
                        style={{ width: 120 }}
                        onChange={(value) => setNumberOfUser(Number(value))}
                        options={[
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                            { value: 5, label: '5' },
                            { value: 6, label: '6' },
                            { value: 7, label: '7' },
                            { value: 8, label: '8' },
                        ]}
                    />
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-3xl text-white font-semibold">total Score</p>
                    <Select
                        defaultValue='10000'
                        style={{ width: 120 }}
                        onChange={(value) => setInitialScore(Number(value))}
                        options={initialScoreOptions}
                    />
                </div>
                <div className="flex flex-col tems-center gap-1">
                    <p className="text-3xl text-white font-semibold">Initial Bet</p>
                    <Checkbox onChange={() => setIsInitialBet(!isInitialBet)} checked={isInitialBet} className="text-white">Use Initial Bet</Checkbox>
                    <Select
                        defaultValue='50'
                        style={{ width: 120 }}
                        onChange={(value) => setInitialBet(Number(value))}
                        disabled={!isInitialBet}
                        options={initialBetOptions}
                    />
                </div>


                <Button type="primary" onClick={() => setIsModalOpen(true)}>Start</Button>
                {isModalOpen && <SingleBeginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userCount={numberOfUser} initialBet={isInitialBet ? initialBet : 0} initialScore={initialScore} />}
            </div>
        </div>

    )
}