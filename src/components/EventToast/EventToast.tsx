import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { toChips } from "../../features/single/chips";
import { describeEvents } from "../../features/single/events";
import { chipSound } from "../../lib/sound";

const SHOW_MS = 2500;

// 누가 베팅·콜·다이·충전했는지, 누가 이겼는지를 잠깐 띄운다. 자리는 BetBoard 의 알림 칸이 정한다.
export default function EventToast() {
    const single = useSelector((state: RootState) => state.single);
    const previous = useRef(single);
    const nextId = useRef(0);
    const [toasts, setToasts] = useState<{ id: number, text: string }[]>([]);

    useEffect(() => {
        const events = describeEvents(previous.current, single);
        // 판돈이 늘면 건 칩 수만큼, 승자가 가져가면 길게 칩 소리를 낸다
        const moved = single.currentRoundTotalScore - previous.current.currentRoundTotalScore;
        if (moved > 0) chipSound(toChips(moved).length);
        else if (moved < 0) chipSound(8);
        previous.current = single;
        if (events.length === 0) return;
        const added = events.map((text) => ({ id: nextId.current++, text }));
        // 이름표를 가리지 않게 최근 2개만 둔다
        setToasts((current) => [...current, ...added].slice(-2));
        const ids = new Set(added.map((toast) => toast.id));
        setTimeout(() => setToasts((current) => current.filter((toast) => !ids.has(toast.id))), SHOW_MS);
    }, [single]);

    return (
        <div aria-live="polite" className="flex flex-col items-center gap-1">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.p
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-black/85 px-4 py-2 text-sm font-medium text-white shadow-lg"
                    >
                        {toast.text}
                    </motion.p>
                ))}
            </AnimatePresence>
        </div>
    )
}
