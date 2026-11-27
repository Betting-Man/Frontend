import { User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { User } from '../../features/single/singleSlice';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

type Props = {
    isLeft: boolean,
    isMe: boolean,
    user: User
}

const behaviorColor = (behavior: User['currentRoundBehavior']) => {
    if (typeof behavior === 'number') return 'text-blue-300';
    if (behavior === 'DIE') return 'text-red-500';
    if (behavior === 'ALL-IN') return 'text-yellow-400';
    return 'text-black';
}

export default function UserCard({ isLeft, isMe, user }: Props) {
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
