# Betting Man

포커 칩 대신 점수를 계산해 주는 베팅 보드예요. 한 기기로 돌려 쓰거나, 방 코드로 여러 기기가 접속해 쓸 수 있어요.

## 실행하기

```bash
npm install
npm run dev          # http://localhost:3000
npm test
```

같은 와이파이의 폰으로 확인하려면 `http://<컴퓨터 IP>:3000`을 여세요.

멀티플레이는 방장 브라우저가 게임 상태를 갖고, 공개 MQTT 브로커(`broker.emqx.io`)가 방장과 참가자 사이의 메시지를 중계해요. 브로커 주소는 `src/features/multi/room.ts`의 `BROKER`에서 바꿀 수 있어요.

## 에셋 출처

- `public/models/poker-chip.glb`: [Poker chip](https://poly.pizza/m/aSeRYpWIbqV) by Poly by Google, [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). 빨간색 재질을 금액별 색으로 바꿔 써요.
