import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useSelector} from 'react-redux';
import { Button } from "@/components/ui/button";
import { RootState } from '../../app/store';
import SingleResultModal from "../SingleResultModal/SingleResultModal";
import SingleSettingModal from "../SingleSettingModal/SingleSettingModal";
import SingleChargeModal from "../SingleChargeModal/SingleChargeModal";

export default function Header() {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 유저 베팅 결과 모달창 오픈 여부
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false); // 유저 세팅 모달창 오픈 여부
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false); // 유저 돈 충전 모달창 오픈 여부

  // 라운드 상태 변수
  const round = useSelector((state: RootState) => state.single.round);
  // 멀티플레이 방 정보
  const { role, code, status } = useSelector((state: RootState) => state.multi);

  return (
    <div id="header" className="flex items-center justify-between p-3">
      <Button onClick={() => setIsResultModalOpen(true)} >Result</Button>
      <div className="flex flex-col items-center">
        <h1 className="text-lg sm:text-2xl">Round - {round}</h1>
        {role !== 'local' && (
          <p className="text-xs text-muted-foreground">
            Room {code}{status !== 'connected' && ' · Reconnecting…'}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setIsSettingModalOpen(true)}>Setting</Button>
        {/* 충전은 참가자에게 보이지 않는다 */}
        {role !== 'guest' && (
          <Button variant="outline" size="icon" aria-label="Recharge" onClick={() => setIsMoneyModalOpen(true)}><Plus /></Button>
        )}
      </div>

      {isResultModalOpen && <SingleResultModal isModalOpen={isResultModalOpen} setIsModalOpen={setIsResultModalOpen} />}
      {isSettingModalOpen && <SingleSettingModal isModalOpen={isSettingModalOpen} setIsModalOpen={setIsSettingModalOpen} />}
      {isMoneyModalOpen && <SingleChargeModal isModalOpen={isMoneyModalOpen} setIsModalOpen=
      {setIsMoneyModalOpen}></SingleChargeModal>}
    </div>
  )
}
