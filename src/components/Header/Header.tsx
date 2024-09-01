import React ,{ useState } from "react";
import {Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';

type Props = {}

export default function Header({ }: Props) {
  // 라운드
  const round = useSelector((state : RootState) => state.single.round);

  return (
    <div className="header flex justify-between p-3">
      <Button type="primary" >종료</Button>
      <h1>Round - {round}</h1>
      <Button type="primary">세팅</Button>
    </div>
  )
}