import React from 'react'
import { Select,Checkbox,Button  } from "antd";
import { useState } from "react";

type Props = {}

export default function Single({}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false); // 유저 닉네임 짓는 모달창 오픈 여부
    const [useInitialBet, setUseInitialBet] = useState(true); // 초기 베팅 여부
    const [numberOfUser, setNumberOfUser] = useState(2); // 참여하는 유저 수

    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };

  return (
    <div className='flex flex-col items-center'>
        <h1>number of users</h1>
        <Select
            defaultValue='2'
            style={{ width: 120 }}
            onChange={(value)=>setNumberOfUser(Number(value))}
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
            onChange={handleChange}
            options={[
                { value: 5000, label: '5000' },
                { value: 10000, label: '10000' },
                { value: 15000, label: '15000' },
                { value: 20000, label: '20000' },
                { value: 25000, label: '25000' },
                { value: 30000, label: '30000' },
                { value: 35000, label: '35000' },
                { value: 40000, label: '40000' },
                { value: 45000, label: '45000' },
                { value: 50000, label: '50000' }
              ]}
        />
        <h1>Initial Bet</h1>
        <Checkbox onChange={()=>setUseInitialBet(!useInitialBet)}>기본 베팅 사용</Checkbox>
        <Select
            defaultValue='10000'
            style={{ width: 120 }}
            onChange={handleChange}
            disabled={useInitialBet}
            options={[
                { value: 5000, label: '5000' },
                { value: 10000, label: '10000' },
                { value: 15000, label: '15000' },
                { value: 20000, label: '20000' },
                { value: 25000, label: '25000' },
                { value: 30000, label: '30000' },
                { value: 35000, label: '35000' },
                { value: 40000, label: '40000' },
                { value: 45000, label: '45000' },
                { value: 50000, label: '50000' }
              ]}
        />
        <Button type="primary">Start</Button>
    </div>
  )
}