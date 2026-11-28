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
    const [name, setName] = useState(() => localStorage.getItem("bm-name") ?? ""); // 지난번에 쓴 이름
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
                    <p className="text-muted-foreground">방장이 시작하기를 기다리는 중…</p>
                </>
            ) : (
                <form
                    className="flex w-full max-w-xs flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        localStorage.setItem("bm-name", name.trim());
                        joinRoom(code, name);
                    }}
                >
                    <h1 className="text-2xl font-semibold">방 참가</h1>
                    <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
                        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                            방 코드
                            <Input className="h-11 bg-background text-center font-mono text-xl uppercase tracking-widest text-foreground" placeholder="6자리" value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" onChange={(e) => setCode(e.target.value.toUpperCase())} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                            이름
                            <Input className="h-11 bg-background text-base text-foreground" placeholder="8자까지" value={name} maxLength={8} enterKeyHint="done" onChange={(e) => setName(e.target.value)} />
                        </label>
                    </div>
                    {multi.error && <p role="alert" className="text-center text-destructive">{multi.error}</p>}
                    <Button type="submit" size="lg" className="h-12 w-full" disabled={code.length !== 6 || !name.trim()}>참가</Button>
                    <Button type="button" variant="ghost" className="h-11" onClick={() => navigate('/')}>뒤로</Button>
                </form>
            )}
        </motion.div>
    )
}
