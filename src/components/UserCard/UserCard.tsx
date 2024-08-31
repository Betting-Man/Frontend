import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type Props = {
    isTurn: boolean,
    isLeft : boolean,
}

export default function UserCard({ isTurn,isLeft }: Props) {
    return (
        <div className={`flex items-center p-2 ${isTurn ? 'bg-third rounded-md' : ''}`}>
            {!isLeft && <div>
                <p>라운드 금액</p>
                <p>전에 한 행동</p>
            </div>}
            <div className='flex flex-col items-center '>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>이름</p>
                <p>총 재산</p>
            </div>
            {isLeft && <div>
                <p>라운드 금액</p>
                <p>전에 한 행동</p>
            </div>}
            
            
        </div>
    )
}