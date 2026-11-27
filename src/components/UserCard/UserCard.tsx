import { User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { User } from '../../features/single/singleSlice';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

type Props = {
    isLeft: boolean,
    isMe: boolean,
    user: User,
    // 멀티플레이에서 다른 사람을 화면 위에 작게 보여 줄 때 쓴다
    compact?: boolean
}

const behaviorColor = (behavior: User['currentRoundBehavior']) => {
    if (typeof behavior === 'number') return 'text-blue-300';
    if (behavior === 'DIE') return 'text-red-500';
    if (behavior === 'ALL-IN') return 'text-yellow-400';
    return 'text-black';
}

export default function UserCard({ isLeft, isMe, user, compact }: Props) {
    if (compact) return (
        <div className={`relative flex w-20 flex-col items-center rounded-md px-1 py-1 text-xs ${user.isDie ? 'opacity-60' : ''}`}>
            {user.isTurn && <motion.div layoutId="turn" className="absolute inset-0 rounded-md bg-accent" />}
            <p className='relative max-w-full truncate'>{user.name}</p>
            <p className='relative'><AnimatedNumber value={user.currentScore} /></p>
            <p className='relative text-sm font-bold'><AnimatedNumber value={user.currentRoundBet} /></p>
            {/* 자리를 미리 잡아 라벨이 생겨도 카드 높이가 변하지 않게 한다 */}
            <p className={`relative h-4 font-bold ${behaviorColor(user.currentRoundBehavior)}`}>
                {user.currentRoundBehavior !== 0 && user.currentRoundBehavior}
            </p>
        </div>
    )
    return (
        <div className={`relative flex w-full items-center p-2 ${isLeft ? '' : 'flex-row-reverse'} ${user.isDie ? 'opacity-60' : ''}`}>
            {/* 턴 강조 배경 - 턴이 바뀌면 다음 유저 카드로 미끄러진다 */}
            {user.isTurn && <motion.div layoutId="turn" className="absolute inset-0 rounded-md bg-accent" />}
            <div className={`relative flex w-full grow flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                <UserIcon className={`size-8 ${isMe ? 'text-primary' : ''}`} />
                <p>{user.name}</p>
                <p className='font-medium'><AnimatedNumber value={user.currentScore} /></p>
            </div>
            <div className='relative flex w-full grow-3 flex-col items-center'>
                <p className='font-bold'><AnimatedNumber value={user.currentRoundBet} /></p>
                <AnimatePresence mode="popLayout">
                    {user.currentRoundBehavior !== 0 && (
                        <motion.p
                            key={user.currentRoundBehavior}
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className={`text-2xl font-bold ${behaviorColor(user.currentRoundBehavior)}`}
                        >
                            {user.currentRoundBehavior}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
