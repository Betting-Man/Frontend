import { Select, Checkbox, Button, Modal, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useUserposition from "../../hooks/useUserPostition";
import UserNameInput from "../UserNameInput/UserNameInput";
import { useSelector, useDispatch } from 'react-redux';
import { setUserCount, setUsers, setInitialBet, setUserTurnOrder, setInitialRoundSetting } from "../../features/single/singleSlice";
import { RootState } from "../../app/store";
import { User } from "../../features/single/singleSlice";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleResultModal({ isModalOpen, setIsModalOpen, }: Props) {

    const users = useSelector((state: RootState) => state.single.users);

    return (
        <Modal title="Game Result" width="500px" okText="Start" open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
            <div className="flex flex-col gap-4">
                {users.map((user) => {
                    const scoreDifference = user.currentScore - user.initialScore;
                    const scoreClass = scoreDifference > 0 ? 'text-red-500' : 'text-blue-500';

                    return (
                        <p key={user.name} className={scoreClass}>
                            {user.name} : {scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference}
                        </p>
                    );
                })}
            </div>
        </Modal>
    )
}