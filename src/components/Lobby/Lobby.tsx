import React from "react";
import { User as UserIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

// 대기실 - 방 코드와 들어온 사람 목록
export default function Lobby() {
    const { code, players, seat, status } = useSelector((state: RootState) => state.multi);

    return (
        <div className="flex w-full max-w-xs flex-col items-center gap-4">
            <p className="text-muted-foreground">Room Code</p>
            <p className="font-mono text-5xl font-bold tracking-widest">{code}</p>
            <p className="text-sm text-muted-foreground">
                {status === 'connected' ? `Players ${players.length} / 8` : 'Connecting…'}
            </p>
            <ul className="flex w-full flex-col gap-2">
                {players.map((name, index) => (
                    <li key={name} className="flex items-center gap-2 rounded-md bg-card p-3">
                        <UserIcon className={`size-5 ${seat === index ? 'text-primary' : ''}`} />
                        {name}
                        {index === 0 && <span className="ml-auto text-xs text-muted-foreground">Host</span>}
                    </li>
                ))}
            </ul>
        </div>
    )
}
