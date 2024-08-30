

import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
}

export default function RightUserCard({ }: Props) {
    return (
        <div className='flex items-center'>
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
    )
}