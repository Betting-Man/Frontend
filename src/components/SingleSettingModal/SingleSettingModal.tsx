import React from 'react'
import { Checkbox } from "@/components/ui/checkbox";
import { isSoundOn, setSoundOn } from "../../lib/sound";
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleSettingModal({isModalOpen, setIsModalOpen}: Props) {
  return (
    <GameDialog title="설정" okText="저장" onOk={() => setIsModalOpen(false)} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <label className="flex items-center gap-3 py-2">
            <Checkbox defaultChecked={isSoundOn()} onCheckedChange={(checked) => setSoundOn(checked === true)} />
            칩 소리
        </label>
    </GameDialog>
  )
}
