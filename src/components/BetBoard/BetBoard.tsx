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
      <div className='flex justify-between '>
        <Button type="primary" onClick={handleNumberClick}>100</Button>
        <Button type="primary" onClick={handleNumberClick}>500</Button>
        <Button type="primary" onClick={handleNumberClick}>1000</Button>
        <Button type="primary" onClick={handleBetClick}>BET</Button>
        <Button type="primary" onClick={handleCancelClick}>CANCEL</Button>
      </div>
      <div className='flex justify-around mt-6'>
        <Button type="primary" onClick={handleCallClick}>CHECK / CALL</Button>
        <Button type="primary" onClick={handleAllInClick}>ALL-IN</Button>
        <Button type="primary" onClick={handleDieClick}>DIE</Button>
      </div>

    </div>
  )
}