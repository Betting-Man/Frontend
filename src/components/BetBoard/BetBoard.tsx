import { Button } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { dieUser, incrementUserCurrentRoundBehavior,resetUserCurrentRoundBehavior,betScore,CheckOrCall, AllIn } from "../../features/single/singleSlice";

type Props = {}

export default function BetBoard({ }: Props) {
  const dispatch = useDispatch();

  // 100, 500, 1000 클릭했을 때
  const handleNumberClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.textContent;
    dispatch(incrementUserCurrentRoundBehavior(Number(value)));

  };

  // Bet 클릭했을 때
  const handleBetClick = () => {
    dispatch(betScore());
  }

  // Cancel 클릭했을 때
  const handleCancelClick = () => {
    dispatch(resetUserCurrentRoundBehavior());
  }

  // Check/Call 클릭했을 때
  const handleCallClick = () => {
    dispatch(CheckOrCall());
  }

  // Check/Call 클릭했을 때
  const handleAllInClick = () => {
    dispatch(AllIn());
  }

  // Die 클릭했을 때
  const handleDieClick = () => {
    dispatch(dieUser());
  }

  return (
    <div className='bg-secondary px-3 py-6 absolute bottom-0 w-[600px] max-w-full'>
      <div className='flex justify-between gap-4 '>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>100</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>500</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>1000</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleBetClick}>BET</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleCancelClick}>CANCEL</Button>
      </div>
      <div className='flex justify-around gap-4 mt-6'>
        <Button className="bg-black flex-grow-2" type="primary" onClick={handleCallClick}>CHECK / CALL</Button>
        <Button className="bg-yellow-500 flex-grow-1 hover:bg-black" type="primary" onClick={handleAllInClick}>ALL-IN</Button>
        <Button className="bg-red-500 flex-grow-1" type="primary" onClick={handleDieClick}>DIE</Button>
      </div>
    </div>
  )
}