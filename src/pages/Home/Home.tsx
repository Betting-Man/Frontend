import React, { useEffect } from 'react'
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { leaveRoom } from '../../features/multi/room';

export default function Home() {
  // 홈으로 나오면 멀티플레이 방을 떠난다
  useEffect(() => leaveRoom(), []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex h-full flex-col items-center justify-center gap-4 p-6'>
      <h1 className='mb-6 text-4xl font-bold'>Betting Man</h1>
      <Button asChild size="lg" className='h-12 w-full max-w-xs'><Link to="/single">Single Device</Link></Button>
      <Button asChild size="lg" className='h-12 w-full max-w-xs'><Link to="/host">Create Room</Link></Button>
      <Button asChild size="lg" variant="outline" className='h-12 w-full max-w-xs'><Link to="/join">Join with Code</Link></Button>
    </motion.div>
  )
}
