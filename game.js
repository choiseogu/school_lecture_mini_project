/* ============================================
   공룡 달리기 게임 (game.js)
   - 🎮 게임 버튼을 누르면 나타납니다
   - 스페이스바 또는 클릭으로 점프해서 🌵 선인장을 피하세요
   ============================================ */

// 화면에서 필요한 요소들을 가져옵니다
const gameToggle = document.getElementById("gameToggle"); // 게임 버튼
const gameBox = document.getElementById("game");          // 게임 영역(박스)
const canvas = document.getElementById("gameCanvas");     // 그림 그릴 도화지
const ctx = canvas.getContext("2d");                      // 도화지에 그리는 '붓'
const scoreEl = document.getElementById("gameScore");     // 점수 표시 칸

// 게임에 쓰이는 값들 (숫자를 바꾸면 난이도가 달라져요)
const GROUND_Y = 170;   // 바닥의 높이 (공룡이 서 있는 선)
const GRAVITY = 0.8;    // 중력 : 클수록 빨리 떨어짐
const JUMP_POWER = -13; // 점프 힘 : 작을수록(음수 클수록) 높이 뜀

// 게임 '상태'를 담는 변수들
let dino;          // 공룡 정보 (위치, 속도)
let obstacles;     // 선인장 목록
let score;         // 점수
let speed;         // 선인장이 다가오는 속도
let spawnTimer;    // 다음 선인장이 나올 때까지 남은 시간
let isRunning;     // 게임이 진행 중인가?
let isOver;        // 게임 오버 상태인가?

// 게임을 처음 상태로 되돌립니다 (시작 & 다시하기에 공통 사용)
function resetGame() {
  dino = { x: 50, y: GROUND_Y - 40, size: 40, vy: 0 }; // 바닥 위에 놓기
  obstacles = [];
  score = 0;
  speed = 6;
  spawnTimer = 0;
  isRunning = true;
  isOver = false;
  scoreEl.textContent = "0";
  loop(); // 그림 그리기 반복 시작
}

// 공룡을 점프시킵니다 (바닥에 있을 때만)
function jump() {
  const onGround = dino.y >= GROUND_Y - dino.size;
  if (onGround) dino.vy = JUMP_POWER;
}

// 새 선인장 하나를 오른쪽 끝에 만듭니다
function spawnObstacle() {
  const height = 30 + Math.random() * 20; // 높이를 조금씩 다르게
  obstacles.push({ x: canvas.width, w: 24, h: height });
}

// 두 사각형이 겹치는지(부딪혔는지) 검사합니다
function isHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.size > b.x &&
    a.y < b.y + b.h &&
    a.y + a.size > b.y
  );
}

// 게임의 핵심 반복 : 1초에 약 60번 실행되며 화면을 다시 그립니다
function loop() {
  // 도화지를 깨끗이 지웁니다
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 바닥 선 그리기
  ctx.strokeStyle = "#d1d5db";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // --- 공룡 움직임 (점프/낙하) ---
  dino.vy += GRAVITY;   // 중력으로 아래로 당기기
  dino.y += dino.vy;    // 속도만큼 이동
  const floor = GROUND_Y - dino.size;
  if (dino.y > floor) { // 바닥보다 내려가면 바닥에 고정
    dino.y = floor;
    dino.vy = 0;
  }
  // 공룡 그리기 (이모지로 간단하게)
  ctx.font = "36px serif";
  ctx.fillText("🦖", dino.x, dino.y + dino.size);

  // --- 선인장 만들기/움직이기 ---
  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    // 다음 선인장까지의 간격 (랜덤이라 지루하지 않아요)
    spawnTimer = 70 + Math.random() * 60;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.x -= speed; // 왼쪽으로 이동
    // 선인장 그리기
    ctx.font = ob.h + "px serif";
    ctx.fillText("🌵", ob.x, GROUND_Y);

    // 공룡과 부딪혔는지 검사 (충돌 상자는 살짝 작게 잡아 억울한 죽음을 방지)
    const dinoBox = { x: dino.x + 6, y: dino.y + 6, size: dino.size - 14 };
    const obBox = { x: ob.x + 4, y: GROUND_Y - ob.h + 4, w: ob.w - 8, h: ob.h - 8 };
    if (isHit(dinoBox, obBox)) gameOver();

    // 화면 왼쪽으로 사라진 선인장은 목록에서 제거
    if (ob.x + ob.w < 0) obstacles.splice(i, 1);
  }

  // --- 점수 올리기 ---
  if (isRunning) {
    score++;
    scoreEl.textContent = Math.floor(score / 5); // 너무 빨리 오르지 않게
    // 점수가 오를수록 조금씩 빨라지게 (난이도 상승)
    speed = 6 + score / 800;
  }

  // 게임 오버 화면
  if (isOver) {
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("게임 오버!", canvas.width / 2 - 60, 80);
    ctx.font = "15px sans-serif";
    ctx.fillText("스페이스바 또는 클릭으로 다시 시작", canvas.width / 2 - 130, 110);
    return; // 반복을 멈춤 (다시 시작하면 resetGame이 다시 돌림)
  }

  // 다음 화면을 그리도록 예약 (반복의 핵심)
  requestAnimationFrame(loop);
}

// 게임 오버 처리
function gameOver() {
  isRunning = false;
  isOver = true;
}

/* --------------------------------------------
   버튼 / 키보드 / 클릭 연결
   -------------------------------------------- */

// 🎮 버튼 : 게임 영역을 보이거나 숨깁니다
gameToggle.addEventListener("click", () => {
  gameBox.hidden = !gameBox.hidden; // 숨김 <-> 보임 뒤집기
  if (!gameBox.hidden) {
    resetGame();
    // 게임이 화면 가운데 오도록 부드럽게 스크롤
    gameBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

// 점프 또는 다시 시작을 처리하는 함수
function handleAction() {
  if (gameBox.hidden) return;       // 게임이 안 보이면 무시
  if (isOver) resetGame();          // 게임 오버 상태면 다시 시작
  else jump();                      // 아니면 점프
}

// 스페이스바 누르기
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !gameBox.hidden) {
    e.preventDefault(); // 스페이스로 화면이 스크롤되는 것을 막기
    handleAction();
  }
});

// 도화지 클릭(또는 터치)
canvas.addEventListener("click", handleAction);
