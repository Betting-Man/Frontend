import { User as UserIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Input } from "@/components/ui/input";
import { setNameRedundancy, updateUserName } from '../../features/single/singleSlice';
import React,{ ChangeEvent, useEffect, useState } from 'react';

type Props = {
    user : string,
    index : number,
    isLeft : boolean
}

export default function UserNameInput({user,index,isLeft }: Props) {
    const [userName, setUserName] = useState(user)
    const dispatch = useDispatch();

    // 입력한 이름을 스토어에 반영
    useEffect(() => {
        dispatch(updateUserName([index,userName]))
    }, [dispatch, index, userName]);

    const handleChange =(e: ChangeEvent<HTMLInputElement>)=>{
        dispatch(setNameRedundancy());
        setUserName(e.target.value)
    }

    return (
        <div className="flex items-center gap-4">
            {isLeft && <UserIcon className="size-8 shrink-0" />}
            <Input value={userName} onChange={handleChange} maxLength={8}/>
            {!isLeft && <UserIcon className="size-8 shrink-0" />}
        </div>
    );
}
