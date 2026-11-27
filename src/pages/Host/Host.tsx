import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "../../app/store";
import Lobby from "../../components/Lobby/Lobby";
import { hostRoom, leaveRoom, restoreRoom, startRoom } from "../../features/multi/room";
import { ScoreSetting, ScoreSettingFields } from "../SingleSetting/SingleSetting";

// 방 만들기 → 대기실 → 게임 시작. 방을 만든 브라우저가 방장이다.
export default function Host() {
    const navigate = useNavigate();
    const [name, setName] = useState(() => localStorage.getItem("bm-name") ?? ""); // 지난번에 쓴 이름
    const [copied, setCopied] = useState(false);
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
        else if (navigator.clipboard)
            navigator.clipboard.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        else prompt('참가 링크', link); // http 로 연 경우 클립보드를 쓸 수 없다
    }
    const create = (event: React.FormEvent) => {
        event.preventDefault();
        localStorage.setItem("bm-name", name.trim());
        hostRoom(name, setting);
    }
    const close = () => {
        leaveRoom();
        navigate('/');
    }

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            {role === 'host' ? (
                <>
                    <Lobby />
                    <Button variant="outline" className="h-11 w-full max-w-xs" onClick={share}>{copied ? 'Link Copied!' : 'Share Invite Link'}</Button>
                    <Button className="h-12 w-full max-w-xs" disabled={players.length < 2} onClick={startRoom}>
                        {players.length < 2 ? 'Waiting for players…' : `Start with ${players.length} players`}
                    </Button>
                    <Button variant="ghost" className="h-11" onClick={close}>Close Room</Button>
                </>
            ) : (
                <form onSubmit={create} className="flex w-full max-w-xs flex-col gap-4">
                    <h1 className="text-2xl font-semibold">Create Room</h1>
                    <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
                        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                            Your Name
                            <Input autoFocus className="h-11 bg-background text-base text-foreground" placeholder="Up to 8 characters" value={name} maxLength={8} enterKeyHint="done" onChange={(e) => setName(e.target.value)} />
                        </label>
                        <ScoreSettingFields onChange={setSetting} />
                    </div>
                    <Button type="submit" size="lg" className="h-12 w-full" disabled={!name.trim()}>Create Room</Button>
                    <Button type="button" variant="ghost" className="h-11" onClick={() => navigate('/')}>Back</Button>
                </form>
            )}
        </motion.div>
    )
}
