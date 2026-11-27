import React from 'react'
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleSettingModal({isModalOpen, setIsModalOpen}: Props) {
  return (
    <GameDialog title="설정" okText="저장" onOk={() => setIsModalOpen(false)} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col gap-4">
            <p>세팅창</p>
        </div>
    </GameDialog>
  )
}
