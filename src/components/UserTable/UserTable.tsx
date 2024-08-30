
import React from 'react'
import LeftUserCard from "../UserCard/LeftUserCard";
import RightUserCard from "../UserCard/RightUserCard";

type Props = {}

export default function UserTable({ }: Props) {
    return (
        <div className='p-3 flex'>
            <div id='leftUser' className='flex flex-col w-1/2 gap-4'>
                <LeftUserCard />
                <LeftUserCard />
                <LeftUserCard />
            </div>
            <div id='rightUser' className='flex flex-col w-1/2 gap-4'>
                <RightUserCard />
                <RightUserCard />
            </div>
        </div>
    )
}