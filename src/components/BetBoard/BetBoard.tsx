import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { RootState } from "../../app/store";
import { BET_AMOUNTS, CHIP_COLORS } from "../../features/single/chips";
import { dieUser, incrementUserCurrentRoundBehavior,resetUserCurrentRoundBehavior,betScore,CheckOrCall, AllIn } from "../../features/single/singleSlice";

// 모바일 터치 영역 44px 이상
const buttonCss = "h-11 min-w-0 grow px-2 tall:h-12 tall:text-lg active:scale-95";

export default function BetBoard() {
  const dispatch = useDispatch();
  // 멀티플레이에서는 방장도 참가자도 자기 턴에만 누를 수 있다
  const disabled = useSelector((state: RootState) =>
    state.multi.role !== "local" && state.multi.seat !== state.single.userTurnOrder[0]
  );

  return (
    <div id="bet_board" className='bg-card px-3 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]'>
      <div className='flex items-center justify-between gap-2 '>
        {/* 칩 버튼 - 3D 칩과 같은 색 */}
        {BET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            disabled={disabled}
            onClick={() => dispatch(incrementUserCurrentRoundBehavior(amount))}
            style={{ backgroundColor: CHIP_COLORS[amount] }}
            className="size-12 shrink-0 cursor-pointer rounded-full border-4 border-dashed border-white/80 text-sm font-bold text-white shadow-md transition-transform active:scale-90 disabled:pointer-events-none disabled:opacity-50 tall:size-14"
          >
            {amount}
          </button>
        ))}
        <Button className={buttonCss} disabled={disabled} onClick={() => dispatch(betScore())}>BET</Button>
        <Button className={buttonCss} disabled={disabled} variant="outline" onClick={() => dispatch(resetUserCurrentRoundBehavior())}>CANCEL</Button>
      </div>
      <div className='flex justify-around gap-4 mt-4'>
        <Button className={`${buttonCss} grow-2 bg-black text-white hover:bg-black/80`} disabled={disabled} onClick={() => dispatch(CheckOrCall())}>CHECK / CALL</Button>
        <Button className={`${buttonCss} bg-yellow-500 text-black hover:bg-yellow-500/90`} disabled={disabled} onClick={() => dispatch(AllIn())}>All-IN</Button>
        <Button className={buttonCss} disabled={disabled} variant="destructive" onClick={() => dispatch(dieUser())}>DIE</Button>
      </div>
    </div>
  )
}
