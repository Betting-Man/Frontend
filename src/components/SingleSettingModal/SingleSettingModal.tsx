import Modal from 'antd/es/modal/Modal';
import React from 'react'

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleSettingModal({isModalOpen, setIsModalOpen}: Props) {
    const handleSaveClick = () =>{

        setIsModalOpen(false)
    }


  return (
    <Modal title="Game Result" width="500px" okText="Save" onOk={handleSaveClick} open={isModalOpen} cancelText='Cancel' onCancel={() => setIsModalOpen(false)}>
            <div className="flex flex-col gap-4">
                <p>세팅창</p>
            </div>
        </Modal>
  )
}