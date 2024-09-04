import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { User } from '../../features/single/singleSlice';

type Props = {
    isLeft: boolean,
    user: User
}

export default function UserCard({ isLeft, user }: Props) {
    return (
        <div className={`w-full flex items-center p-2 ${user.isTurn ? 'bg-third rounded-md' : ''}`}>
            {!isLeft && (
                <div className={`flex flex-col flex-grow-3 w-full items-center ${isLeft ? '' : 'ml-auto '} `}>
                    <p className='text-white font-bold'>{user.currentRoundBet}</p>
                    {user.currentRoundBehavior !== 0 && (
                        <p className={`font-bold text-2xl ${typeof user.currentRoundBehavior === 'string'
                                ? user.currentRoundBehavior === 'DIE'
                                    ? 'text-red-800'
                                    : user.currentRoundBehavior === 'ALL-IN'
                                        ? 'text-yellow-400' // ALL-IN이면 노란색
                                        : 'text-black'
                                : 'text-blue-500'
                            }`}>
                            {user.currentRoundBehavior}
                        </p>
                    )}
                </div>
            )}
            <div className={`flex flex-col flex-grow-1 w-full ${isLeft ? 'items-start' : ' items-end'}`}>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p className='text-white '>{user.name}</p>
                <p className='text-white font-medium'>{user.currentScore}</p>
            </div>
            {isLeft && (
                <div className='flex flex-col flex-grow-3 w-full items-center'>
                    <p className='text-white font-bold'>{user.currentRoundBet}</p>
                    {user.currentRoundBehavior !== 0 && (
                        <p className={`font-bold text-2xl ${typeof user.currentRoundBehavior === 'string'
                                ? user.currentRoundBehavior === 'DIE'
                                    ? 'text-red-800'
                                    : user.currentRoundBehavior === 'ALL-IN'
                                        ? 'text-yellow-400' // ALL-IN이면 노란색
                                        : 'text-black'
                                : 'text-blue-500'
                            }`}>
                            {user.currentRoundBehavior}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}