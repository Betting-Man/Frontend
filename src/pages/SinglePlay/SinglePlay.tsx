import React, { Suspense, lazy, useEffect } from 'react'
import { motion } from 'motion/react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../app/store';
import Header from '../../components/Header/Header'
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard'
import UserTable from '../../components/UserTable/UserTable'
import BetBoard from '../../components/BetBoard/BetBoard'
import { restoreRoom } from '../../features/multi/room';

// 3D 라이브러리는 게임 화면에 들어올 때만 불러온다
const BetTable3D = lazy(() => import('../../components/BetTable3D/BetTable3D'));
// 유저 목록이 차지하고 남은 높이를 3D 테이블이 쓴다
const tableCss = 'min-h-28 w-full grow basis-0';

export default function SinglePlay() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const hasUsers = useSelector((state: RootState) => state.single.users.length > 0);

  // 새로고침으로 상태가 사라졌을 때: 멀티플레이는 저장된 방으로 돌아가고, 한 기기 모드는 설정 화면으로 간다
  useEffect(() => {
    if (roomId === '1') {
      if (!hasUsers) navigate('/single', { replace: true });
    } else if (!restoreRoom(roomId)) {
      navigate('/', { replace: true });
    }
  }, [roomId, hasUsers, navigate]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex h-full flex-col'>
        <Header/>
        <ScoreBoard/>
        <Suspense fallback={<div className={tableCss} />}>
          <BetTable3D className={tableCss} />
        </Suspense>
        <div className='max-h-[45%] shrink-0 overflow-y-auto'>
          <UserTable/>
        </div>
        <BetBoard/>
    </motion.div>
  )
}
