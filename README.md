# Betting Man

포커 칩 대신 점수를 계산해 주는 베팅 보드예요. 한 기기로 돌려 쓰거나, 방 코드로 여러 기기가 접속해 쓸 수 있어요.

## 실행하기

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev:https    # https://<컴퓨터 IP>:3443 - 폰에서 멀티플레이를 확인할 때
npm test
```

멀티플레이는 `localhost`가 아니면 HTTPS에서만 동작해요. 같은 와이파이의 폰으로 확인하려면 `npm run dev:https`로 띄우고, 폰 브라우저의 인증서 경고에서 "계속 진행"을 누르세요. `dev`와 `dev:https`는 동시에 띄울 수 없어요.

## 에셋 출처

- `public/models/poker-chip.glb`: [Poker chip](https://poly.pizza/m/aSeRYpWIbqV) by Poly by Google, [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). 빨간색 재질을 금액별 색으로 바꿔 써요.
