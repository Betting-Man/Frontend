# Betting Man

포커 칩 대신 점수를 계산해 주는 베팅 보드예요. 한 기기로 돌려 쓰거나, 방 코드로 여러 기기가 접속해 쓸 수 있어요.

## 실행하기

```bash
npm install
npm run dev          # http://localhost:3000
npm test
```

같은 와이파이의 폰으로 확인하려면 `http://<컴퓨터 IP>:3000`을 여세요.

멀티플레이는 방장 브라우저가 게임 상태를 갖고, Cloudflare Worker(`server/room.js`)가 방장과 참가자 사이의 메시지를 웹소켓으로 중계해요.

## 배포하기

Worker 하나가 화면(`dist`)과 방 서버를 함께 내보내요. 설정은 `wrangler.toml`에 있어요.

```bash
npx wrangler deploy   # 빌드한 뒤 https://betting-man-room.rhljh7410.workers.dev 에 배포
```

방 서버만 로컬에서 띄우려면 `npx wrangler dev`를 실행하고, 화면은 `VITE_ROOM_SERVER=ws://localhost:8787 npm run dev`로 띄우세요.

## 에셋 출처

- `public/models/poker-chip.glb`: [Poker chip](https://poly.pizza/m/aSeRYpWIbqV) by Poly by Google, [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). 빨간색 재질을 금액별 색으로 바꿔 써요.
- `public/models/person.glb`: [Man](https://poly.pizza/m/HMnuH5geEG) by Quaternius, [CC0](https://creativecommons.org/publicdomain/zero/1.0/). 셔츠 재질을 사람별 색으로 바꿔 써요.
