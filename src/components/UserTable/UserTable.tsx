
import React from 'react'
import LeftUserCard from "../UserCard/LeftUserCard";
import RightUserCard from "../UserCard/RightUserCard";

type Props = {}

export default function UserTable({ }: Props) {
    // 유저들에 대한 턴 배열

    return (
        <div className='p-3 flex'>
            <div id='leftUser' className='flex flex-col w-1/2 gap-4'>
                <LeftUserCard isTurn={false}/>
                <LeftUserCard isTurn={false}/>
                <LeftUserCard isTurn={false}/>
            </div>
            <div id='rightUser' className='flex flex-col w-1/2 gap-4'>
                <RightUserCard isTurn={true} />
                <RightUserCard isTurn={false}/>
            </div>
        </div>
    )
}