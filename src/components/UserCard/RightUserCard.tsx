

import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    isTurn : boolean;
}

export default function RightUserCard({isTurn }: Props) {
    return (
        <div className={`flex items-center p-2 ${isTurn ? 'bg-third rounded-md' : ''}`}>
            <div>
                <p>Round Score</p>
                <p>전에 한 행동</p>
            </div>
            <div className='flex flex-col items-center'>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>UserName</p>
                <p>UserScore</p>
            </div>
        </div>
    );
}