import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "../../app/store";
import Lobby from "../../components/Lobby/Lobby";
import { joinRoom, restoreRoom } from "../../features/multi/room";

// 방 코드와 이름으로 참가 → 대기실 → 방장이 시작하면 게임 화면으로
export default function Join() {
    const navigate = useNavigate();
    const params = useParams();
    const [code, setCode] = useState(params.code ?? "");
    const [name, setName] = useState("");
    const multi = useSelector((state: RootState) => state.multi);
    const isJoined = multi.role === 'guest' && multi.status !== 'error';

    // 새로고침하면 들어가 있던 방으로 돌아간다
    useEffect(() => {
        restoreRoom(params.code?.toUpperCase());
    }, [params.code]);

    useEffect(() => {
        if (multi.role === 'guest' && multi.started) navigate(`/single/${multi.code}`, { replace: true });
    }, [multi.role, multi.started, multi.code, navigate]);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            {isJoined ? (
                <>
                    <Lobby />
                    <p className="text-muted-foreground">Waiting for the host to start…</p>
                </>
            ) : (
                <>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-3xl font-semibold">Room Code</p>
                        <Input className="h-11 w-40 bg-card text-center font-mono uppercase tracking-widest" value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" onChange={(e) => setCode(e.target.value.toUpperCase())} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-3xl font-semibold">Your Name</p>
                        <Input className="h-11 w-40 bg-card" value={name} maxLength={8} onChange={(e) => setName(e.target.value)} />
                    </div>
                    {multi.error && <p role="alert" className="text-destructive">{multi.error}</p>}
                    {/* 멀티플레이는 localhost 가 아니면 HTTPS 에서만 동작한다 */}
                    {!window.isSecureContext && <p role="alert" className="text-center text-destructive">HTTPS 주소로 열어야 방에 연결할 수 있어요.</p>}
                    <Button size="lg" className="h-11" disabled={code.length !== 6 || !name.trim() || !window.isSecureContext} onClick={() => joinRoom(code, name)}>Join</Button>
                </>
            )}
        </motion.div>
    )
}
