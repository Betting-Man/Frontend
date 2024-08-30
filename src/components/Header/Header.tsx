
import React from 'react'
import { useState } from "react";
import {Button } from "antd";

type Props = {}

export default function Header({ }: Props) {
  const [roundCount, setRoundCount] = useState(1) // 라운드 수
  return (
    <div className="header flex justify-between p-3">
      <button className='bg-white'>종료</button>
      <h1>Round - {roundCount}</h1>
      <button className='bg-white'>세팅</button>
    </div>
  )
}