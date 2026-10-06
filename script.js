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
