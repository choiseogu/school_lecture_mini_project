/* ============================================
   동작 파일 (script.js)
   - 클릭, 스크롤 등 '움직임'을 담당합니다
   ============================================ */

/* --------------------------------------------
   1) 카드를 클릭하면 소개가 펼쳐지고, 다시 누르면 닫힙니다
   -------------------------------------------- */

// 화면에 있는 모든 .card 를 찾아옵니다 (초/중/고 카드)
const cards = document.querySelectorAll(".card");

// 각 카드마다 '클릭했을 때 할 일'을 정해줍니다
cards.forEach((card) => {
  card.addEventListener("click", () => {
    // 지금 열려 있는지 확인 ("true" 문자열이면 열린 상태)
    const isOpen = card.dataset.open === "true";

    // 열려 있으면 닫고, 닫혀 있으면 엽니다 (반대로 뒤집기)
    card.dataset.open = isOpen ? "false" : "true";
    // → CSS가 이 값을 보고 자동으로 펼치거나 접습니다
  });
});


/* --------------------------------------------
   2) 스크롤해서 내려오면 내용이 스르륵 나타납니다
   - IntersectionObserver: 요소가 화면에 보이는지 감시하는 도구
   -------------------------------------------- */

// 나타나게 할 대상들 (.reveal 이 붙은 요소들)
const revealTargets = document.querySelectorAll(".reveal");

// 감시자를 만듭니다. 대상이 화면에 들어오면 함수가 실행됩니다
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // isIntersecting : 지금 화면 안에 보이는가?
      if (entry.isIntersecting) {
        entry.target.classList.add("show"); // 'show'를 붙여 나타나게 함
        observer.unobserve(entry.target);    // 한 번 나타나면 감시 종료
      }
    });
  },
  {
    threshold: 0.15, // 요소가 15% 정도 보이면 실행
  }
);

// 모든 대상을 감시 시작
revealTargets.forEach((target) => observer.observe(target));


/* --------------------------------------------
   3) 공룡 점프 게임
   - '게임' 버튼을 누르면 하단에 게임이 나타납니다
   - 스페이스 바로 점프해서 장애물(선인장)을 피합니다
   -------------------------------------------- */

const gameToggleBtn = document.getElementById("gameToggleBtn");
const dinoGame = document.getElementById("dinoGame");
const canvas = document.getElementById("dinoCanvas");
const scoreLabel = document.getElementById("dinoScore");

if (gameToggleBtn && dinoGame && canvas) {
  const ctx = canvas.getContext("2d");

  // 캔버스의 실제 픽셀 크기는 항상 600x200 기준으로 계산합니다
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const GROUND_Y = HEIGHT - 30;

  const GRAVITY = 1600;      // 아래로 떨어지는 힘 (px/s^2)
  const JUMP_SPEED = 620;    // 점프 시작 속도 (px/s)
  const DINO_SIZE = 36;
  const DINO_X = 60;

  let dinoY = GROUND_Y - DINO_SIZE;   // 공룡의 y 좌표 (위쪽 기준)
  let velocityY = 0;
  let isJumping = false;

  let obstacles = [];        // 화면에 있는 장애물들
  let spawnTimer = 0;
  let nextSpawnIn = 1.2;

  let speed = 260;           // 장애물이 왼쪽으로 이동하는 속도 (px/s)
  let score = 0;
  let isRunning = false;     // 게임 루프가 도는 중인가
  let isGameOver = false;
  let lastTime = null;
  let rafId = null;

  function resetGame() {
    dinoY = GROUND_Y - DINO_SIZE;
    velocityY = 0;
    isJumping = false;
    obstacles = [];
    spawnTimer = 0;
    nextSpawnIn = 1.2;
    speed = 260;
    score = 0;
    isGameOver = false;
    scoreLabel.textContent = "0";
  }

  function jump() {
    if (isGameOver) {
      resetGame();
      return;
    }
    if (!isJumping) {
      isJumping = true;
      velocityY = -JUMP_SPEED;
    }
  }

  function spawnObstacle() {
    const h = 30 + Math.random() * 20;
    obstacles.push({
      x: WIDTH,
      y: GROUND_Y - h,
      w: 18,
      h,
    });
  }

  function update(dt) {
    if (isGameOver) return;

    // 공룡 물리 (점프/낙하)
    velocityY += GRAVITY * dt;
    dinoY += velocityY * dt;
    if (dinoY >= GROUND_Y - DINO_SIZE) {
      dinoY = GROUND_Y - DINO_SIZE;
      velocityY = 0;
      isJumping = false;
    }

    // 장애물 생성
    spawnTimer += dt;
    if (spawnTimer >= nextSpawnIn) {
      spawnTimer = 0;
      nextSpawnIn = 0.9 + Math.random() * 1.1;
      spawnObstacle();
    }

    // 장애물 이동 + 화면 밖으로 나가면 제거
    speed += dt * 6; // 시간이 지날수록 살짝 빨라짐
    obstacles.forEach((ob) => (ob.x -= speed * dt));
    obstacles = obstacles.filter((ob) => ob.x + ob.w > 0);

    // 충돌 검사 (사각형끼리 겹치는지)
    const dinoBox = { x: DINO_X, y: dinoY, w: DINO_SIZE, h: DINO_SIZE };
    for (const ob of obstacles) {
      if (
        dinoBox.x < ob.x + ob.w &&
        dinoBox.x + dinoBox.w > ob.x &&
        dinoBox.y < ob.y + ob.h &&
        dinoBox.y + dinoBox.h > ob.y
      ) {
        isGameOver = true;
        break;
      }
    }

    // 점수 : 시간이 지날수록 증가
    score += dt * 10;
    scoreLabel.textContent = Math.floor(score).toString();
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 배경
    ctx.fillStyle = "#f5f5f7";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 바닥 선
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.stroke();

    // 공룡 (이모지 이미지로 표현, 기본 방향이 뒤(왼쪽)를 보고 있어 좌우 반전해서 앞(오른쪽)을 보게 함)
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `${DINO_SIZE}px "Segoe UI Emoji", sans-serif`;
    const dinoCenterX = DINO_X + DINO_SIZE / 2;
    ctx.save();
    ctx.translate(dinoCenterX, 0);
    ctx.scale(-1, 1);
    ctx.fillText("🦖", 0, dinoY + DINO_SIZE);
    ctx.restore();

    // 장애물 (선인장 이모지)
    obstacles.forEach((ob) => {
      ctx.font = `${ob.h}px "Segoe UI Emoji", sans-serif`;
      ctx.fillText("🌵", ob.x + ob.w / 2, ob.y + ob.h);
    });

    // 게임 오버 문구
    if (isGameOver) {
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("게임 오버! 스페이스 바로 다시 시작", WIDTH / 2, HEIGHT / 2);
    }
  }

  function loop(time) {
    if (!isRunning) return;
    if (lastTime === null) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05); // 너무 큰 간격 방지
    lastTime = time;

    update(dt);
    draw();

    rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    if (isRunning) return;
    isRunning = true;
    lastTime = null;
    rafId = requestAnimationFrame(loop);
  }

  function stopGame() {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  // 게임 버튼 클릭 → 게임 보이기/숨기기
  gameToggleBtn.addEventListener("click", () => {
    const isOpen = !dinoGame.hidden;
    if (isOpen) {
      dinoGame.hidden = true;
      gameToggleBtn.setAttribute("aria-expanded", "false");
      stopGame();
    } else {
      dinoGame.hidden = false;
      gameToggleBtn.setAttribute("aria-expanded", "true");
      resetGame();
      draw();
      startGame();
      dinoGame.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // 스페이스 바 → 점프 (게임이 열려있을 때만 동작, 페이지 스크롤 방지)
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || dinoGame.hidden) return;
    e.preventDefault();
    jump();
  });

  // 좌클릭(캔버스 클릭) → 점프
  canvas.addEventListener("click", () => {
    if (dinoGame.hidden) return;
    jump();
  });
}
