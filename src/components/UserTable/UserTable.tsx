import React from 'react'
import UserCard from "../UserCard/UserCard";
import { useSelector} from 'react-redux';
import { RootState } from '../../app/store';

export default function UserTable() {
    const users = useSelector((state: RootState) => state.single.users)
    const seat = useSelector((state: RootState) => state.multi.seat)

    return (
        <div id='user_table' className='p-3 flex'>
            <div id='leftUser' className='flex flex-col w-1/2'>
                {users.map((user, index) => (
                    index % 2 === 0 && <UserCard key={index} isLeft={true} isMe={seat === index} user={user}/>
                ))}
            </div>
            <div id='rightUser' className='flex flex-col w-1/2'>
            {users.map((user, index) => (
                    index % 2 === 1 && <UserCard key={index} isLeft={false} isMe={seat === index} user={user}/>
                ))}
            </div>
        </div>
    )
}
