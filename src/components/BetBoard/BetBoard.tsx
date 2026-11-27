import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Button } from "@/components/ui/button";
import { RootState } from "../../app/store";
import EventToast from "../EventToast/EventToast";
import { betProblem } from "../../features/single/betProblem";
import { BET_AMOUNTS, CHIP_COLORS } from "../../features/single/chips";
import { dieUser, incrementUserCurrentRoundBehavior,resetUserCurrentRoundBehavior,betScore,CheckOrCall, AllIn } from "../../features/single/singleSlice";

// 모바일 터치 영역 44px 이상
const buttonCss = "h-11 min-w-0 grow px-2 tall:h-12 tall:text-lg active:scale-95";

export default function BetBoard() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const [notice, setNotice] = useState<string | null>(null);
  // 지금 턴인 사람 이름 - 내 턴이 아닐 때 누구를 기다리는지 보여 준다
  const turnName = useSelector((state: RootState) => state.single.users[state.single.userTurnOrder[0]]?.name);

  // 알림은 3초 뒤에 사라진다
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  // 버튼을 누르면 실행하고, 그대로 되지 않는 이유가 있으면 알려 준다
  const press = (kind: "chip" | "bet" | "other", action: Parameters<typeof dispatch>[0], amount?: number) => {
    setNotice(betProblem(store.getState().single, kind, amount));
    dispatch(action);
  };
  // 멀티플레이에서는 방장도 참가자도 자기 턴에만 누를 수 있다
  const disabled = useSelector((state: RootState) =>
    state.multi.role !== "local" && state.multi.seat !== state.single.userTurnOrder[0]
  );

  return (
    <div id="bet_board" className='relative bg-card px-3 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]'>
      {/* 알림 칸 - 내 정보 줄 위, 테이블 아래쪽. 다른 사람의 행동과 내 베팅이 그대로 되지 않은 이유를 띄운다. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-full mb-12 flex flex-col items-center gap-1">
        <EventToast />
        <AnimatePresence>
          {notice && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-black/85 px-4 py-3 text-center text-sm text-white shadow-lg"
            >
              {notice}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {disabled && turnName && <p className="-mt-2 mb-2 text-center text-xs text-muted-foreground">{turnName} 님 차례예요</p>}
      <div className='flex items-center justify-between gap-2 '>
        {/* 칩 버튼 - 3D 칩과 같은 색 */}
        {BET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            disabled={disabled}
            onClick={() => press("chip", incrementUserCurrentRoundBehavior(amount), amount)}
            style={{ backgroundColor: CHIP_COLORS[amount] }}
            className="size-12 shrink-0 cursor-pointer rounded-full border-4 border-dashed border-white/80 text-sm font-bold text-white shadow-md transition-transform active:scale-90 disabled:pointer-events-none disabled:opacity-50 tall:size-14"
          >
            {amount}
          </button>
        ))}
        <Button className={buttonCss} disabled={disabled} onClick={() => press("bet", betScore())}>베팅</Button>
        <Button className={buttonCss} disabled={disabled} variant="outline" onClick={() => press("other", resetUserCurrentRoundBehavior())}>취소</Button>
      </div>
      <div className='flex justify-around gap-4 mt-4'>
        <Button className={`${buttonCss} grow-2 bg-black text-white hover:bg-black/80`} disabled={disabled} onClick={() => press("other", CheckOrCall())}>체크 / 콜</Button>
        <Button className={`${buttonCss} bg-yellow-500 text-black hover:bg-yellow-500/90`} disabled={disabled} onClick={() => press("other", AllIn())}>올인</Button>
        <Button className={buttonCss} disabled={disabled} variant="destructive" onClick={() => press("other", dieUser())}>다이</Button>
      </div>
    </div>
  )
}
