import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { User } from '../../features/single/singleSlice';

type Props = {
    isTurn: boolean,
    isLeft : boolean,
    user : User
}

export default function UserCard({ isTurn,isLeft,user }: Props) {
    return (
        <div className={`flex items-center p-2 ${isTurn ? 'bg-third rounded-md' : ''}`}>
            {!isLeft && <div>
                <p>{user.currentRoundBet}</p>
                <p>{user.currentRoundBehavior}</p>
            </div>}
            <div className='flex flex-col items-center '>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>{user.name}</p>
                <p>{user.currentScore}</p>
            </div>
            {isLeft && <div>
                <p>{user.currentRoundBet}</p>
                <p>{user.currentRoundBehavior}</p>
            </div>}
        </div>
    )
}