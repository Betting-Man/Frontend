import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "../../app/store";
import Lobby from "../../components/Lobby/Lobby";
import { hostRoom, restoreRoom, startRoom } from "../../features/multi/room";
import { ScoreSetting, ScoreSettingFields } from "../SingleSetting/SingleSetting";

// 방 만들기 → 대기실 → 게임 시작. 방을 만든 브라우저가 방장이다.
export default function Host() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [setting, setSetting] = useState<ScoreSetting>({ initialScore: 5000, initialBet: 50 });
    const { role, code, players, started } = useSelector((state: RootState) => state.multi);

    // 새로고침하면 만들어 둔 방으로 돌아간다
    useEffect(() => {
        restoreRoom();
    }, []);

    useEffect(() => {
        if (role === 'host' && started) navigate(`/single/${code}`, { replace: true });
    }, [role, started, code, navigate]);

    const link = `${window.location.origin}/join/${code}`;
    const share = () => {
        if (navigator.share) navigator.share({ title: 'Betting Man', url: link }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => alert('참가 링크를 복사했어요!'));
        else prompt('참가 링크', link); // http 로 연 경우 클립보드를 쓸 수 없다
    }

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            {role === 'host' ? (
                <>
                    <Lobby />
                    <Button variant="outline" className="h-11 w-full max-w-xs" onClick={share}>Share Link</Button>
                    <Button className="h-11 w-full max-w-xs" disabled={players.length < 2} onClick={startRoom}>Start</Button>
                </>
            ) : (
                <>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-3xl font-semibold">Your Name</p>
                        <Input className="h-11 w-40 bg-card" value={name} maxLength={8} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <ScoreSettingFields onChange={setSetting} />
                    {/* 멀티플레이는 localhost 가 아니면 HTTPS 에서만 동작한다 */}
                    {!window.isSecureContext && <p role="alert" className="text-center text-destructive">HTTPS 주소로 열어야 방에 연결할 수 있어요.</p>}
                    <Button size="lg" className="h-11" disabled={!name.trim() || !window.isSecureContext} onClick={() => hostRoom(name, setting)}>Create Room</Button>
                </>
            )}
        </motion.div>
    )
}
