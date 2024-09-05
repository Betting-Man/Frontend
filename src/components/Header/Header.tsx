import React ,{ useState } from "react";
import {Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import SingleResultModal from "../SingleResultModal/SingleResultModal";
import SingleSettingModal from "../SingleSettingModal/SingleSettingModal";

type Props = {}

export default function Header({ }: Props) {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 유저 베팅 결과 모달창 오픈 여부
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false); // 유저 베팅 결과 모달창 오픈 여부
  // 라운드 상태 변수
  const round = useSelector((state : RootState) => state.single.round);

  // Result 버튼 클릭
  const handleResultClick = () =>{
    setIsResultModalOpen(true);
  }

  // Setting 버튼 클릭
  const handleSettingClick = () =>{
    setIsSettingModalOpen(true);
  }

  return (
    <div className="header flex justify-between p-3">
      <Button type="primary" onClick={handleResultClick} >Result</Button>
      <h1 className="text-2xl">Round - {round}</h1>
      <Button type="primary" onClick={handleSettingClick}>Setting</Button>
      {isResultModalOpen && <SingleResultModal isModalOpen={isResultModalOpen} setIsModalOpen={setIsResultModalOpen}/>}
      {isSettingModalOpen && <SingleSettingModal isModalOpen={isResultModalOpen} setIsModalOpen={setIsResultModalOpen}/>}
    </div>
  )
}