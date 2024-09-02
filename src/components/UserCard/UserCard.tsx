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
        <div className={`flex items-center p-2 ${user.isTurn ? 'bg-third rounded-md' : ''}`}>
            {!isLeft && (
                <div>
                    <p>{user.currentRoundBet}</p>
                    {user.currentRoundBehavior !== 0 && (
                        <p className={
                            typeof user.currentRoundBehavior === 'string'
                                ? user.currentRoundBehavior === 'DIE'
                                    ? 'text-red-500'
                                    : 'text-black'
                                : 'text-blue-500'
                        }>
                            {user.currentRoundBehavior}
                        </p>
                    )}
                </div>
            )}
            <div className='flex flex-col items-center'>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>{user.name}</p>
                <p>{user.currentScore}</p>
            </div>
            {isLeft && (
                <div>
                    <p>{user.currentRoundBet}</p>
                    {user.currentRoundBehavior !== 0 && (
                        <p className={
                            typeof user.currentRoundBehavior === 'string'
                                ? user.currentRoundBehavior === 'DIE'
                                    ? 'text-red-500'
                                    : 'text-black'
                                : 'text-blue-500'
                        }>
                            {user.currentRoundBehavior}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}