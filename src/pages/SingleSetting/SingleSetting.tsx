import { Select, Checkbox, Button, Modal, Input } from "antd";
import React,{ useState } from "react";
import { useNavigate } from 'react-router-dom';
import RightUserNameInput from "../../components/UserNameInput/UserNameInput";
import useUserposition from "../../hooks/useUserPostition";
import SingleBeginModal from "../../components/SingleBeginModal/SingleBeginModal";


type Props = {}

export default function Single({ }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false); // 유저 닉네임 짓는 모달창 오픈 여부
    const [isInitialBet, setIsInitialBet] = useState(false); // 초기 베팅 여부
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
        <div className='flex flex-col items-center'>
            <h1>number of users</h1>
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
            <h1>total Score</h1>
            <Select
                defaultValue='10000'
                style={{ width: 120 }}
                onChange={(value)=> setInitialScore(Number(value))}
                options={initialScoreOptions}
            />
            <h1>Initial Bet</h1>
            <Checkbox onChange={() => setIsInitialBet(!isInitialBet)} checked={!isInitialBet}>기본 베팅 사용</Checkbox>
            <Select
                defaultValue='50'
                style={{ width: 120 }}
                onChange={(value)=>setInitialBet(Number(value))}
                disabled={isInitialBet}
                options={initialBetOptions}
            />
            <Button type="primary" onClick={()=>setIsModalOpen(true)}>Start</Button>
            {isModalOpen && <SingleBeginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userCount={numberOfUser} initialBet={initialBet} initialScore={initialScore} />}
        </div>
    )
}