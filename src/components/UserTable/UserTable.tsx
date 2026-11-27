import React from 'react'
import UserCard from "../UserCard/UserCard";
import { useSelector} from 'react-redux';
import { RootState } from '../../app/store';

export default function UserTable() {
    const users = useSelector((state: RootState) => state.single.users)
    const seat = useSelector((state: RootState) => state.multi.seat)

    // 멀티플레이: 다른 사람만 작게 늘어놓는다. 내 카드는 SinglePlay 가 베팅 버튼 위에 따로 그린다.
    if (seat !== null) return (
        <div id='user_table' className='flex flex-wrap justify-center gap-1 px-2 py-1'>
            {users.map((user, index) => (
                index !== seat && <UserCard key={index} compact isLeft isMe={false} user={user}/>
            ))}
        </div>
    )

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
