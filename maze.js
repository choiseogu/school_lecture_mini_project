/* ============================================
   미로 탈출 게임 (maze.js)
   - 🧩 미로 버튼을 누르면 나타납니다
   - 방향키(← ↑ → ↓)로 움직여 🚪 출구를 찾으세요
   ============================================ */

// 화면에서 필요한 요소들을 가져옵니다
const mazeToggle = document.getElementById("mazeToggle"); // 미로 버튼
const mazeBox = document.getElementById("maze");          // 미로 영역(박스)
const mazeCanvas = document.getElementById("mazeCanvas"); // 그림 그릴 도화지
const mctx = mazeCanvas.getContext("2d");                 // 도화지에 그리는 '붓'
const mazeMoves = document.getElementById("mazeMoves");   // 움직인 횟수 표시 칸
const mazeReset = document.getElementById("mazeReset");   // 다시하기 버튼

/* 미로 지도
   # = 벽 (못 지나감)
   . = 길 (지나갈 수 있음)
   S = 출발 위치 (Start)
   E = 출구      (Exit)
   → 글자를 직접 바꾸면 나만의 미로를 만들 수 있어요! (가로 길이는 모두 같아야 해요) */
const MAZE_MAP = [
  "###############",
  "#S..#.........#",
  "##.##.###.###.#",
  "#..#..#...#...#",
  "#.##.##.###.###",
  "#....#..#.....#",
  "#.####.##.###.#",
  "#.#....#..#...#",
  "#.#.####.##.#.#",
  "#...........#E#",
  "###############",
];

const CELL = 40; // 칸 하나의 크기(픽셀). 지도 15칸 x 40 = 600 (도화지 가로와 같아요)

// 게임 '상태'를 담는 변수들
let player;   // 플레이어의 현재 위치 { col: 가로칸, row: 세로칸 }
let moves;    // 움직인 횟수
let cleared;  // 탈출에 성공했는가?

// 지도에서 특정 글자(S, E)가 있는 칸의 위치를 찾아줍니다
function findCell(letter) {
  for (let row = 0; row < MAZE_MAP.length; row++) {
    const col = MAZE_MAP[row].indexOf(letter);
    if (col !== -1) return { col: col, row: row };
  }
  return { col: 1, row: 1 }; // 못 찾으면 기본 위치
}

// 게임을 처음 상태로 되돌립니다
function resetMaze() {
  player = findCell("S"); // 출발 위치로
  moves = 0;
  cleared = false;
  mazeMoves.textContent = "0";
  drawMaze();
}

// 미로와 플레이어를 화면에 그립니다
function drawMaze() {
  mctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  // 지도를 한 칸씩 살펴보며 그리기
  for (let row = 0; row < MAZE_MAP.length; row++) {
    for (let col = 0; col < MAZE_MAP[row].length; col++) {
      const tile = MAZE_MAP[row][col]; // 이 칸의 글자
      const x = col * CELL;            // 실제 화면 가로 위치
      const y = row * CELL;            // 실제 화면 세로 위치

      // 벽은 진한 회색, 길은 흰색으로 칠하기
      mctx.fillStyle = tile === "#" ? "#374151" : "#ffffff";
      mctx.fillRect(x, y, CELL, CELL);

      // 출구 자리에는 문 그림 그리기
      if (tile === "E") {
        mctx.fillStyle = "#111827";
        mctx.font = CELL - 10 + "px serif";
        mctx.fillText("🚪", x + 5, y + CELL - 7);
      }
    }
  }

  // 플레이어 그리기
  mctx.fillStyle = "#111827";
  mctx.font = CELL - 12 + "px serif";
  mctx.fillText("🙂", player.col * CELL + 6, player.row * CELL + CELL - 8);

  // 탈출 성공 메시지
  if (cleared) {
    mctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    mctx.fillRect(0, mazeCanvas.height / 2 - 50, mazeCanvas.width, 100);

    mctx.fillStyle = "#1a1a1a";
    mctx.textAlign = "center"; // 글자를 가운데 정렬
    mctx.font = "bold 28px sans-serif";
    mctx.fillText("탈출 성공! 🎉", mazeCanvas.width / 2, mazeCanvas.height / 2 - 5);
    mctx.font = "15px sans-serif";
    mctx.fillText(
      moves + "번 만에 탈출했어요!",
      mazeCanvas.width / 2,
      mazeCanvas.height / 2 + 25
    );
    mctx.textAlign = "left"; // 정렬을 원래대로 되돌리기
  }
}

// 플레이어를 한 칸 움직입니다 (dCol: 가로 이동, dRow: 세로 이동)
function movePlayer(dCol, dRow) {
  if (cleared) return; // 이미 탈출했으면 더 못 움직임

  const nextCol = player.col + dCol; // 가려는 칸
  const nextRow = player.row + dRow;

  // 지도 밖으로는 못 나감
  if (nextRow < 0 || nextRow >= MAZE_MAP.length) return;
  if (nextCol < 0 || nextCol >= MAZE_MAP[nextRow].length) return;

  // 벽(#)이면 못 지나감 → 여기가 미로의 핵심!
  if (MAZE_MAP[nextRow][nextCol] === "#") return;

  // 이동 성공
  player = { col: nextCol, row: nextRow };
  moves++;
  mazeMoves.textContent = moves;

  // 도착한 칸이 출구(E)라면 성공!
  if (MAZE_MAP[nextRow][nextCol] === "E") cleared = true;

  drawMaze(); // 바뀐 위치로 다시 그리기
}

/* --------------------------------------------
   버튼 / 방향키 연결
   -------------------------------------------- */

// 어떤 키를 누르면 어느 방향으로 갈지 정해둔 표
const KEY_MOVES = {
  ArrowUp: [0, -1],    // 위  : 세로로 -1칸
  ArrowDown: [0, 1],   // 아래: 세로로 +1칸
  ArrowLeft: [-1, 0],  // 왼쪽: 가로로 -1칸
  ArrowRight: [1, 0],  // 오른쪽: 가로로 +1칸
};

window.addEventListener("keydown", (e) => {
  if (mazeBox.hidden) return;      // 미로가 안 보이면 무시

  const direction = KEY_MOVES[e.key];
  if (!direction) return;          // 방향키가 아니면 무시

  e.preventDefault();              // 방향키로 화면이 스크롤되는 것을 막기
  movePlayer(direction[0], direction[1]);
});

// 🧩 버튼 : 미로를 보이거나 숨깁니다
mazeToggle.addEventListener("click", () => {
  mazeBox.hidden = !mazeBox.hidden;
  if (!mazeBox.hidden) {
    resetMaze();
    mazeBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

// 다시하기 버튼
mazeReset.addEventListener("click", resetMaze);
