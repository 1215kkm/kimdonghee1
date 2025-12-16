window.initSec5 = function () {
  console.log("✅ initSec5 실행됨");

  const root = "#sec5-load";
  const sec = document.querySelector(`${root} .sec5`);
  const cards = gsap.utils.toArray(`${root} .stack-card`);

  console.log("SEC5 요소:", sec);
  console.log("카드 개수:", cards.length);

  // ✅ 모바일: mo-sec5 초기화 (AJAX 로드 후 실행되므로 여기서 처리)
  initMobileSec5();

  if (!sec || !cards.length) {
    console.warn("⚠️ SEC5 요소를 찾을 수 없음 - 모바일 버전만 실행");
    return;
  }

  gsap.set(sec, { autoAlpha: 1 });

  // ✅ PC 버전: 카드 스택 애니메이션
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * (window.innerWidth <= 768 ? 4.8 : 2.4)),
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    }
  });

  cards.forEach((el, i) => {
    tl.fromTo(el,
      { opacity: 0, y: 140, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" },
      i ? ">" : 0
    )
    .to(el, { y: -12, duration: 0.5, ease: "power1.out" }, ">")
    .to(el, {
      opacity: 0.3,
      scale: 0.95,
      y: -40,
      duration: 0.8,
      ease: "power2.in"
    }, ">");
  });

  ScrollTrigger.refresh(true);
  console.log("✅ PC 버전 애니메이션 설정 완료");
};

// ✅ 모바일 버전 초기화 함수 (분리)
function initMobileSec5() {
  const moSec5 = document.querySelector(".mo-sec5");
  const cards = document.querySelectorAll(".mo-sec5 ul li");

  console.log("모바일 SEC5:", moSec5);
  console.log("모바일 카드 개수:", cards.length);

  if (!cards.length) {
    console.warn("⚠️ 모바일 카드를 찾을 수 없음");
    return;
  }

  // ✅ IntersectionObserver 미지원 또는 iOS 구버전 폴백
  if (!("IntersectionObserver" in window)) {
    console.warn("⚠️ IntersectionObserver 미지원 - 바로 표시");
    cards.forEach(card => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          console.log("✅ 카드 등장:", entry.target);

          const textbox = entry.target.querySelector('.textbox');
          if (textbox && typeof gsap !== "undefined") {
            gsap.fromTo(textbox.children,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                delay: 0.3
              }
            );
          }

          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,  // iOS에서 더 민감하게
      rootMargin: "0px 0px -5% 0px"
    }
  );

  cards.forEach(card => observer.observe(card));
  console.log("✅ 모바일 Observer 등록 완료");

  // ✅ 터치 효과 (모바일)
  cards.forEach(card => {
    let touchTimer;

    card.addEventListener('touchstart', () => {
      touchTimer = setTimeout(() => {
        card.style.transform = 'scale(1.02)';
        card.style.transition = 'transform 0.3s ease';
      }, 100);
    }, { passive: true });

    card.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
      card.style.transform = 'scale(1)';
    }, { passive: true });
  });
}
