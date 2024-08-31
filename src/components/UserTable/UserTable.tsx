
import React from 'react'
import UserCard from "../UserCard/UserCard";

type Props = {}

export default function UserTable({ }: Props) {
    // 유저들에 대한 턴 배열

    return (
        <div className='p-3 flex'>
            <div id='leftUser' className='flex flex-col w-1/2 gap-4'>
                <UserCard isTurn={false} isLeft={true}/>
                <UserCard isTurn={false} isLeft={true}/>
                <UserCard isTurn={false} isLeft={true}/>
            </div>
            <div id='rightUser' className='flex flex-col w-1/2 gap-4'>
                <UserCard isTurn={true}  isLeft={false}/>
                <UserCard isTurn={false}  isLeft={false}/>
            </div>
        </div>
    )
}