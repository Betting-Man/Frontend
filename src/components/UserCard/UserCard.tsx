import { User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { behaviorText } from '../../features/single/behaviorText';
import { User } from '../../features/single/singleSlice';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

type Props = {
    user: User,
    // 다른 사람을 테이블 건너편 자리에 작게 보여 줄 때 쓴다
    compact?: boolean
}

const behaviorColor = (behavior: User['currentRoundBehavior']) => {
    if (typeof behavior === 'number') return 'text-blue-300';
    if (behavior === 'DIE') return 'text-red-500';
    if (behavior === 'ALL-IN') return 'text-yellow-400';
    return 'text-white';
}

export default function UserCard({ user, compact }: Props) {
    // 이름표 - 3D 캐릭터 머리 위에 띄운다. 남은 금액은 캐릭터 앞의 칩으로 보여 준다.
    if (compact) return (
        <div className={`relative flex flex-col items-center rounded-md px-2 py-0.5 text-xs ${user.isDie ? 'opacity-60' : ''}`}>
            <div className={`absolute inset-0 rounded-md ${user.isTurn ? 'bg-accent' : 'bg-black/40'}`} />
            <p className='relative max-w-20 truncate font-medium'>{user.name}</p>
            {user.currentRoundBehavior !== 0 && (
                <p className={`relative font-bold ${behaviorColor(user.currentRoundBehavior)}`}>{behaviorText(user.currentRoundBehavior)}</p>
            )}
        </div>
    )
    // 화면 주인 - 베팅 버튼 위에 한 줄로 보여 준다
    return (
        <div className={`relative flex items-center gap-2 px-4 py-2 ${user.isDie ? 'opacity-60' : ''}`}>
            {user.isTurn && <motion.div layoutId="turn" className="absolute inset-0 bg-accent" />}
            <UserIcon className='relative size-6 text-primary' />
            <p className='relative truncate'>{user.name}</p>
            <p className='relative font-medium'><AnimatedNumber value={user.currentScore} /></p>
            <AnimatePresence mode="popLayout">
                {user.currentRoundBehavior !== 0 && (
                    <motion.p
                        key={user.currentRoundBehavior}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className={`relative ml-auto text-xl font-bold ${behaviorColor(user.currentRoundBehavior)}`}
                    >
                        {behaviorText(user.currentRoundBehavior)}
                    </motion.p>
                )}
            </AnimatePresence>
            <p className='relative ml-auto font-bold'>베팅 <AnimatedNumber value={user.currentRoundBet} /></p>
        </div>
    )
}
