import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { describeEvents } from "../../features/single/events";

const SHOW_MS = 2500;

// 누가 베팅·콜·다이·충전했는지, 누가 이겼는지를 테이블 위쪽에 잠깐 띄운다
export default function EventToast() {
    const single = useSelector((state: RootState) => state.single);
    const previous = useRef(single);
    const nextId = useRef(0);
    const [toasts, setToasts] = useState<{ id: number, text: string }[]>([]);

    useEffect(() => {
        const events = describeEvents(previous.current, single);
        previous.current = single;
        if (events.length === 0) return;
        const added = events.map((text) => ({ id: nextId.current++, text }));
        // 이름표를 가리지 않게 최근 2개만 둔다
        setToasts((current) => [...current, ...added].slice(-2));
        const ids = new Set(added.map((toast) => toast.id));
        setTimeout(() => setToasts((current) => current.filter((toast) => !ids.has(toast.id))), SHOW_MS);
    }, [single]);

    return (
        <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-1 flex flex-col items-center gap-1">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.p
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-full bg-black/75 px-4 py-1 text-sm font-medium text-white shadow-md"
                    >
                        {toast.text}
                    </motion.p>
                ))}
            </AnimatePresence>
        </div>
    )
}
