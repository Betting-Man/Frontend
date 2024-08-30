import { create } from 'zustand';

// 싱글 게임
interface SingleGameStore {
    numberOfUsers: number; // 해당 게임의 유저 숫자
    setNumberOfUsers: (count: number) => void;
    userNames: string[]; // 유저 이름에 대한 정보
    setUserName: (index: number, name: string) => void;
    resetUserNames: (count: number) => void; // 유저 이름 모두 지우기
}

export const useSingleGameStore = create<SingleGameStore>((set) => ({
    numberOfUsers: 2,
    setNumberOfUsers: (count) => set((state) => {
        const newNames = Array(count).fill('').map((_, i) => state.userNames[i] || '');
        return { numberOfUsers: count, userNames: newNames };
    }),
    userNames: [],  // 초기값으로 2명의 유저
    setUserName: (index, name) => set((state) => {
        const newNames = [...state.userNames];
        newNames[index] = name;
        return { userNames: newNames };
    }),
    resetUserNames: (count) => set(() => ({
        userNames: Array(count).fill('')
    })),
}));