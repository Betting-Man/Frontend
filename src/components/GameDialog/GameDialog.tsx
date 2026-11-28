import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
    title: string,
    open: boolean,
    onClose: () => void,
    okText: string,
    onOk: () => void,
    children: React.ReactNode,
}

// 제목 + 내용 + Cancel / 확인 버튼으로 이루어진 게임 공통 모달
export default function GameDialog({ title, open, onClose, okText, onOk, children }: Props) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent aria-describedby={undefined} className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={onOk}>{okText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
