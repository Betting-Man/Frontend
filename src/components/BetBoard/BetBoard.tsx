import { Button } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { dieUser, incrementUserCurrentRoundBehavior,resetUserCurrentRoundBehavior,betScore,CheckOrCall, AllIn } from "../../features/single/singleSlice";

export default function BetBoard() {
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

  const CheckAndCallButton = () => (
    <Button
      style={{
        backgroundColor: "#000001",
        boxShadow: "none", 
      }}
      type="primary"
      onClick={handleCallClick}
      className=" flex-grow-2"
    >
      CHECK / CALL
    </Button>
  );

  const AllInButton = () => (
    <Button
      style={{
        backgroundColor: "#eab308",
        boxShadow: "none",
      }}
      type="primary" onClick={handleAllInClick}
      className=" flex-grow-1"
    >
      All-IN
    </Button>
  );

  const DieButton = () => (
    <Button
      style={{
        backgroundColor: "#ef4444",
        boxShadow: "none", 
      }}
      type="primary" onClick={handleDieClick}
      className=" flex-grow-1"
    >
      DIE
    </Button>
  );

  return (
    <div className='bg-secondary px-3 py-6 absolute bottom-0 w-[600px] max-w-full'>
      <div className='flex justify-between gap-3 '>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>100</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>500</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleNumberClick}>1000</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleBetClick}>BET</Button>
        <Button className=" flex-grow-1" type="primary" onClick={handleCancelClick}>CANCEL</Button>
      </div>
      <div className='flex justify-around gap-4 mt-6'>
        <CheckAndCallButton />
        <AllInButton/>
        <DieButton/>
      </div>
    </div>
  )
}