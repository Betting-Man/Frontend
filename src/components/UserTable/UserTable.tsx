import React from 'react'
import UserCard from "../UserCard/UserCard";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';

type Props = {}

export default function UserTable({ }: Props) {
    const users = useSelector((state: RootState) => state.single.users)

    return (
        <div className='p-3 flex'>
            <div id='leftUser' className='flex flex-col w-1/2 gap-4'>
                {users.map((user, index) => (
                    index % 2 === 0 && <UserCard key={index} isTurn={false} isLeft={true} user={user}/>
                ))}
            </div>
            <div id='rightUser' className='flex flex-col w-1/2 gap-4'>
            {users.map((user, index) => (
                    index % 2 === 1 && <UserCard key={index} isTurn={false} isLeft={false}user={user}/>
                ))}
            </div>
        </div>
    )
}