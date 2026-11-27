import React from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import GameDialog from "../GameDialog/GameDialog";

type Props = {
    isModalOpen: boolean,
    setIsModalOpen: (isOpen: boolean) => void,
}

export default function SingleResultModal({ isModalOpen, setIsModalOpen, }: Props) {
    const navigate = useNavigate();

    const users = useSelector((state: RootState) => state.single.users);
    const pot = useSelector((state: RootState) => state.single.currentRoundTotalScore);
    const isLocal = useSelector((state: RootState) => state.multi.role === 'local');

    // 손익 = 지금 점수 - 넣은 돈(시작 금액 + 충전). 정산이 끝난 라운드까지만 센다.
    // 진행 중인 라운드에 건 돈은 아직 점수에서 빠지지 않았으므로 손익에 들어가지 않는다.
    const rows = users.map((user) => ({ name: user.name, buyIn: user.initialScore, now: user.currentScore, net: user.currentScore - user.initialScore }));
    const total = rows.reduce((sum, row) => sum + row.net, 0); // 0 이어야 맞다
    const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

    const handleExitClick = () => {
        const copiedText = rows.map((row) => `${row.name}: ${signed(row.net)} (${row.buyIn} → ${row.now})`).join('\n');

        // 클립보드에 복사
        navigator.clipboard.writeText(copiedText).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        }).catch(err => {
            console.error('복사 실패: ', err);
        });

        // 한 기기 모드는 설정 화면으로, 멀티플레이는 홈으로 나간다 (홈에서 방을 떠난다)
        navigate(isLocal ? '/single' : '/');
    }

    return (
        <GameDialog title="Game Result" okText="Exit" onOk={handleExitClick} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <table className="w-full text-right tabular-nums">
                <thead>
                    <tr className="text-xs text-muted-foreground">
                        <th className="py-1 text-left font-normal">Player</th>
                        <th className="font-normal">Buy-in</th>
                        <th className="font-normal">Now</th>
                        <th className="font-normal">Net</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-t border-border">
                            <td className="max-w-24 truncate py-2 text-left">{row.name}</td>
                            <td>{row.buyIn}</td>
                            <td>{row.now}</td>
                            <td className={`font-bold ${row.net > 0 ? 'text-red-400' : row.net < 0 ? 'text-blue-300' : ''}`}>{signed(row.net)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-border text-xs text-muted-foreground">
                        <td className="py-2 text-left" colSpan={3}>Total</td>
                        <td>{signed(total)}</td>
                    </tr>
                </tfoot>
            </table>
            {total !== 0 && <p role="alert" className="mt-2 text-sm text-destructive">합계가 0이 아니에요. 계산이 어긋났어요.</p>}
            {pot > 0 && <p className="mt-2 text-xs text-muted-foreground">진행 중인 라운드에 걸린 {pot}은 아직 정산 전이라 포함하지 않았어요.</p>}
        </GameDialog>
    )
}
