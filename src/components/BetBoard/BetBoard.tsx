import { Button } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { dieUser } from "../../features/single/singleSlice";

type Props = {}

export default function BetBoard({ }: Props) {
  const dispatch = useDispatch();

  // 100, 500, 1000 클릭했을 때
  const handleNumberClick = () =>{

  }

  // Bet 클릭했을 때
  const handleBetClick = () =>{

  }

  // Cancel 클릭했을 때
  const handleCancelClick = () =>{

  }

  // Check/Call 클릭했을 때
  const handleCallClick = () =>{

  }

   // Die 클릭했을 때
   const handleDieClick = () =>{
    dispatch(dieUser());
   }

  return (
    <div className='bg-secondary px-3 py-6 absolute bottom-0 w-96'>
      <div className='flex justify-between '>
        <Button type="primary">100</Button>
        <Button type="primary">500</Button>
        <Button type="primary">1000</Button>
        <Button type="primary">BET</Button>
        <Button type="primary">CANCEL</Button>
      </div>
      <div className='flex justify-around mt-6'>
        <Button type="primary" >CHECK / CALL</Button>
        <Button type="primary" onClick={handleDieClick}>DIE</Button>
      </div>

    </div>
  )
}