import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input } from "antd";
import { useDispatch } from 'react-redux';
import { setNameRedundancy, updateUserName } from '../../features/single/singleSlice';
import React,{ ChangeEvent, useState } from 'react';

type Props = {
    user : string,
    index : number,
    isLeft : boolean
}

export default function UserNameInput({user,index,isLeft }: Props) {
    const [userName, setUserName] = useState(user)
    const dispatch = useDispatch();
    dispatch(updateUserName([index,userName]))

    const handleChange =(e: ChangeEvent<HTMLInputElement>)=>{
        dispatch(setNameRedundancy());
        setUserName(e.target.value)
    }

    const handleBlur = () => {
        dispatch(updateUserName([index,userName]))
    };

    return (
        <div className="flex items-center gap-4">
            {isLeft && <FontAwesomeIcon icon={faUser} size='2xl' />}
            <Input value={userName} onChange={handleChange} onBlur={handleBlur} />
            {!isLeft && <FontAwesomeIcon icon={faUser} size='2xl' />}
        </div>
    );
}