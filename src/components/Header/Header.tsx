import React, { useState } from "react";
import { Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import SingleResultModal from "../SingleResultModal/SingleResultModal";
import SingleSettingModal from "../SingleSettingModal/SingleSettingModal";
import SingleChargeModal from "../SingleChargeModal/SingleChargeModal";
import {
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {}

export default function Header({ }: Props) {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 유저 베팅 결과 모달창 오픈 여부
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false); // 유저 세팅 모달창 오픈 여부
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false); // 유저 돈 충전 모달창 오픈 여부

  // 라운드 상태 변수
  const round = useSelector((state: RootState) => state.single.round);
  // 라운드 시작 여부 변수
  const isStartingRound = useSelector((state: RootState) => state.single.isStartingRound);

  // Result 버튼 클릭
  const handleResultClick = () => {
    setIsResultModalOpen(true);
  }

  // Setting 버튼 클릭
  const handleSettingClick = () => {
    setIsSettingModalOpen(true);
  }

  // Money 버튼 클릭
  const handleMoneyClick = () => {
    setIsMoneyModalOpen(true);
  }

  return (
    <div className="header flex justify-between p-3">
      <Button type="primary" onClick={handleResultClick} >Result</Button>
      <h1 className="text-2xl">Round - {round}</h1>
      <div className="flex gap-2">
        <Button type="primary" onClick={handleSettingClick}>Setting</Button>
        <Button  onClick={handleMoneyClick} disabled={isStartingRound}><FontAwesomeIcon icon={faPlus} /></Button>
      </div>

      {isResultModalOpen && <SingleResultModal isModalOpen={isResultModalOpen} setIsModalOpen={setIsResultModalOpen} />}
      {isSettingModalOpen && <SingleSettingModal isModalOpen={isSettingModalOpen} setIsModalOpen={setIsSettingModalOpen} />}
      {isMoneyModalOpen && <SingleChargeModal isModalOpen={isMoneyModalOpen} setIsModalOpen=
      {setIsMoneyModalOpen}></SingleChargeModal>}
    </div>
  )
}