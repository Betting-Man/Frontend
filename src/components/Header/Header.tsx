import React ,{ useState } from "react";
import {Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import SingleResultModal from "../SingleResultModal/SingleResultModal";

type Props = {}

export default function Header({ }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false); // 유저 닉네임 짓는 모달창 오픈 여부
  // 라운드 상태 변수
  const round = useSelector((state : RootState) => state.single.round);

  // Result 버튼 클릭
  const handleResultClick = () =>{
    setIsModalOpen(true);
  }

  return (
    <div className="header flex justify-between p-3">
      <Button type="primary" onClick={handleResultClick} >Result</Button>
      <h1 className="text-2xl text-white">Round - {round}</h1>
      <Button type="primary">세팅</Button>
      {isModalOpen && <SingleResultModal isModalOpen={true} setIsModalOpen={setIsModalOpen}/>}
    </div>
  )
}