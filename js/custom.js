



document.addEventListener("DOMContentLoaded", () => {
function isMobile() {
  return window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

// ✅ throttle 함수 (iOS 성능 최적화)
function throttle(fn, wait) {
  let lastTime = 0;
  let rafId = null;
  return function(...args) {
    const now = performance.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => fn.apply(this, args));
    }
  };
}














/* ===========================
   1️⃣ Lenis 부드러운 스크롤 (모바일 안전 프리셋)
=========================== */
const _isMobile = isMobile();

// ✅ 전역으로도 잡아두면(로딩 stop/start 등) 나중에 제어하기 쉬움
window.lenis = new Lenis({
  duration: _isMobile ? 0.9 : 1.2, // 모바일은 짧게(답답함 방지)
  easing: (t) => 1 - Math.pow(1 - t, 3),
  smooth: true,
  smoothTouch: false, // ✅ 모바일에서 "전체 터치 스무딩"은 끄는 쪽이 안정적
});

const lenis = window.lenis;

// ScrollTrigger 동기화
if (typeof ScrollTrigger !== "undefined") {
  lenis.on("scroll", ScrollTrigger.update);
}

// GSAP ticker에 Lenis 연결
if (typeof gsap !== "undefined") {
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}


/* ===========================
   2️⃣ 마우스 유리효과 (intro 안에서만)
=========================== */
const cursor = document.querySelector('.cursor-glass');
const glowText = document.querySelector('.glow-text');
const intro = document.querySelector('.intro');
let rafId = null;

function handleMove(e) {
  if (!intro || !cursor) return;
  const rect = intro.getBoundingClientRect();
  const inIntro =
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (inIntro) {
    cursor.style.opacity = '0.9';
    cursor.style.transform = `translate(${e.clientX - cursor.offsetWidth / 2}px, ${e.clientY - cursor.offsetHeight / 2}px)`;
  } else {
    cursor.style.opacity = '0';
  }

  if (glowText) {
    const t = glowText.getBoundingClientRect();
    const cx = t.left + t.width / 2;
    const cy = t.top + t.height / 2;
    const distance = Math.hypot(e.clientX - cx, e.clientY - cy);
    const maxDistance = 400;
    const intensity = Math.max(0, 1 - distance / maxDistance);
    const glowSize = 10 + intensity * 25;
    const glowColor = `rgba(255,155,177,${0.15 + intensity * 0.35})`;
    glowText.style.textShadow = `
      0 0 ${glowSize}px ${glowColor},
      0 0 ${glowSize * 10}px ${glowColor}
    `;
  }
}

/* document.addEventListener('mousemove', (e) => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => handleMove(e));
}); */
if (isMobile()) {
  // 모바일은 cursor-glass 완전 비활성화
  const cursor = document.querySelector('.cursor-glass');
  if (cursor) cursor.style.display = "none";

  document.removeEventListener('mousemove', () => {});
  document.removeEventListener('touchmove', () => {});
  // handleMove 자체가 실행되지 않음
} else {
  // 🔵 기존 PC 코드 유지
  document.addEventListener('mousemove', (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => handleMove(e));
  });
}

/* intro → sec1 → sec2 배경 전환 (throttle 적용) */
window.addEventListener('scroll', throttle(() => {
  const sec2 = document.querySelector('.sec2');
  if (!sec2) return;

  const rect = sec2.getBoundingClientRect();
  const winH = window.innerHeight;
  const start = winH * 0.8;
  const end = winH * 0.2;

  let progress = (start - rect.top) / (start - end);
  progress = Math.min(Math.max(progress, 0), 1);

  sec2.style.setProperty("--bg-opacity", progress.toFixed(2));
}, 16), { passive: true });

/* ===========================
   4️⃣ SVG 싸인 애니메이션
=========================== */
window.addEventListener("DOMContentLoaded", () => {
  const paths = document.querySelectorAll("#swoosh-mark path");
  paths.forEach(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    p.style.transition = "none";
  });

  setTimeout(() => {
    paths.forEach((p, i) => {
      p.style.transition = `stroke-dashoffset 2s ease-in-out ${i * 0.1}s`;
      p.style.strokeDashoffset = 0;
    });
  }, 300);
});

/* ===========================
   5️⃣ 메뉴 색상 전환 (throttle 적용)
=========================== */
// 캐시된 DOM 요소
const menuLinksCache = document.querySelectorAll('.menu .pc-menu li a');
let lastActiveColor = "#fff";

window.addEventListener('scroll', throttle(() => {
  const sections = document.querySelectorAll('section');

  if (sections.length === 0 || menuLinksCache.length === 0) return;

  const winH = window.innerHeight;
  let activeColor = "#fff";

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const inView = rect.top < winH * 0.5 && rect.bottom > winH * 0.5;

    if (inView) {
      if (sec.classList.contains("sec15") || sec.classList.contains("intro")) {
        activeColor = "#223A5E";
      } else {
        activeColor = "#fff";
      }
    }
  });

  // 색상이 바뀔 때만 애니메이션 실행 (불필요한 호출 방지)
  if (lastActiveColor !== activeColor) {
    lastActiveColor = activeColor;
    menuLinksCache.forEach(a =>
      gsap.to(a, { color: activeColor, duration: 0.35, ease: "power2.out" })
    );
  }
}, 50), { passive: true });



/* ===========================
   6️⃣ Swiper (sec2 슬라이드)
=========================== */
const swiper = new Swiper(".mySwiper", {
  effect: "slide",
  grabCursor: true,
  loop: true,
  speed: 800,
  spaceBetween: 20,
  centeredSlides: true,
  slidesPerView: 1,
  touchMoveStopPropagation: true,
  touchStartForcePreventDefault: true,
  touchReleaseOnEdges: false,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

/* ===========================
   7️⃣ PC 메뉴 (PC에서만)
=========================== */
if (window.innerWidth > 768) {
  const navLinks = document.querySelectorAll('.menu .pc-menu .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();

      const target = document.querySelector(link.dataset.target);
      if (target && window.lenis) {
        window.lenis.scrollTo(target, {
          offset: 0,
          duration: 3,
          easing: t => 1 - Math.pow(1 - t, 3)
        });
      }

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}


// ===========================
// 📱 MOBILE MENU (NEW)
// ===========================
if (window.innerWidth <= 768) {
  const btn = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('.mobile-menu');
  const links = document.querySelectorAll('.mobile-menu .mobile-nav-link');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const opened = menu.classList.toggle('show');
      btn.classList.toggle('active', opened);
    });
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();

      let targetSelector = link.dataset.target;
      let target = null;

      // ✅ sec5 특별 처리 (AJAX 로드된 섹션)
      if (targetSelector === '.sec5') {
        // 모바일에서는 .mo-sec5로 이동
        target = document.querySelector('.mo-sec5');
        if (!target) {
          // 폴백: #sec5-load로 이동
          target = document.querySelector('#sec5-load');
        }
      } else {
        target = document.querySelector(targetSelector);
      }

      if (target && window.lenis) {
        window.lenis.scrollTo(target, {
          offset: 0,
          duration: 1.0,
          easing: t => 1 - Math.pow(1 - t, 3)
        });
      }

      menu.classList.remove('show');
      btn && btn.classList.remove('active');
    });
  });
}


/* ===========================
   8️⃣ 3D 기울기(tilt) 효과
=========================== */
document.querySelectorAll(".slide-content").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * 10;
    const rotateY = ((x / rect.width) - 0.5) * -10;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });
});


/* ===========================
   ✅ sec2 하단 카드 Swiper - 부드러운 무빙 + 드래그 자연스럽게
=========================== */

// 기존 swiper 인스턴스 제거
if (window.cardSwiper) window.cardSwiper.destroy(true, true);

window.cardSwiper = new Swiper(".cardSwiper", {
  loop: true,
  centeredSlides: true,
  grabCursor: true,
  watchSlidesProgress: true,
  slidesPerView: 1,
  spaceBetween: 30,

  // ✅ 모바일에서 autoplay 비활성화 (iOS 성능 문제)
  autoplay: _isMobile ? false : {
    delay: 0,
    disableOnInteraction: false,
  },

  // ✅ 모바일에서 속도 줄임
  speed: _isMobile ? 800 : 5000,

  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1200: { slidesPerView: 3 }
  },

  on: {
    init(swiper) {
      if (!_isMobile) {
        swiper.wrapperEl.style.transitionTimingFunction = "linear";
      }
    },
    slideChangeTransitionStart(swiper) {
      if (!_isMobile) {
        swiper.wrapperEl.style.transitionTimingFunction = "linear";
      }
    }
  }
});

// ✅ CSS: 무조건 linear
const style = document.createElement("style");
style.innerHTML = `
  .cardSwiper .swiper-wrapper {
    transition-timing-function: linear !important;
  }
`;
document.head.appendChild(style);


/* ==============================
   ✅ Lenis 모바일 최적화 (iOS 버벅임 방지)
============================== */
// smoothTouch는 iOS에서 버벅임을 유발하므로 비활성화 유지
if (!_isMobile) {
  lenis.options.duration = 0.5;
}

/* =========================
   SEC2 이미지 클릭 → 내부 텍스트 박스 열기
========================= */
document.querySelectorAll(".slide-content").forEach(slide => {

  slide.addEventListener("click", () => {
    // 이미 열려 있으면 닫기
    if (slide.classList.contains("active")) {
      slide.classList.remove("active");
      return;
    }

    // 다른 슬라이드 열려 있으면 닫기
    document.querySelectorAll(".slide-content.active")
      .forEach(opened => opened.classList.remove("active"));

    // 현재 슬라이드 열기
    slide.classList.add("active");
  });
});



/* ===========================
   SEC1 애니메이션 (회사 소개)
=========================== */
gsap.registerPlugin(ScrollTrigger);

// 1. 섹션 전체 페이드 인
gsap.from(".sec1-inner", {
  scrollTrigger: {
    trigger: ".sec1",
    start: "top 80%",
    end: "top 40%",
    scrub: 1.2
  },
  opacity: 0,
  y: 60,
  ease: "power2.out"
});


gsap.from(".sec1-logo", {
  scrollTrigger: {
    trigger: ".sec1",
    start: "top 60%"
  },
  opacity: 0,
  scale: 0.85,
  duration: 1.2,
  ease: "power2.out"
});


window.cardSwiper2 = new Swiper(".cardSwiper2", {
  loop: true,
  centeredSlides: true,
  grabCursor: true,
  slidesPerView: 1,
  spaceBetween: 30,

  // ✅ 모바일에서 autoplay 비활성화
  autoplay: _isMobile ? false : {
    delay: 0,
    disableOnInteraction: false,
  },

  speed: _isMobile ? 800 : 5000,

  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1200: { slidesPerView: 3 }
  },

  on: {
    init(swiper) {
      if (!_isMobile) {
        swiper.wrapperEl.style.transitionTimingFunction = "linear";
      }
    },
    slideChangeTransitionStart(swiper) {
      if (!_isMobile) {
        swiper.wrapperEl.style.transitionTimingFunction = "linear";
      }
    }
  }
});






function lockScrollDuringSwiper(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  let startX = 0;
  let startY = 0;
  let direction = null; // null / 'horizontal' / 'vertical'
  const threshold = 8;

  const preventScroll = (e) => e.preventDefault();

  el.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      direction = null; // 방향 매 터치마다 초기화
    },
    { passive: true }
  );

  el.addEventListener(
    "touchmove",
    (e) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);

      // 아직 방향이 결정되지 않았다면 판별
      if (direction === null) {
        if (dx > dy + threshold) {
          direction = "horizontal"; // 슬라이드
          document.body.addEventListener("touchmove", preventScroll, {
            passive: false,
          });
        } else if (dy > dx + threshold) {
          direction = "vertical"; // 스크롤
        }
      }

      // 이미 가로 방향으로 결정된 경우 → 강제 고정
      if (direction === "horizontal") {
        e.preventDefault(); // 슬라이드 중 스크롤 절대 허용 X
      }
    },
    { passive: false }
  );

  el.addEventListener("touchend", () => {
    document.body.removeEventListener("touchmove", preventScroll);
    direction = null;
  });
}



// 적용할 슬라이드
lockScrollDuringSwiper(".mySwiper");
lockScrollDuringSwiper(".mySwiper .swiper-wrapper");
lockScrollDuringSwiper(".mySwiper .swiper-slide");
lockScrollDuringSwiper(".mySwiper .slide-content");

lockScrollDuringSwiper(".cardSwiper");
lockScrollDuringSwiper(".cardSwiper .swiper-wrapper");
lockScrollDuringSwiper(".cardSwiper .swiper-slide");
lockScrollDuringSwiper(".cardSwiper .card");









gsap.registerPlugin(ScrollTrigger);

function playTypingAnimation() {
  const content    = document.querySelector(".typing-content");
  const cursor     = document.querySelector(".typing-cursor");
  const typingText = document.querySelector(".typing-text");
  const typingRow  = document.querySelector(".typing-row");
  const typingBox  = document.querySelector(".sec1-typing-box");
  const icon       = document.querySelector(".typing-search-icon");

  if (!content || !cursor || !typingText) {
    console.log("타이핑 요소를 찾을 수 없음");
    return;
  }

  // ✅ 최대 타이핑 길이에 맞춰 서치바 폭 고정 (모바일에서 실제로 보일 때만)
  if (typingRow && typingBox && typingBox.offsetParent !== null) {
    const prevText = content.textContent;

    const fullTextForMeasure = "네이비베이가 궁금하다면 ?";
    content.textContent = fullTextForMeasure;

    const textWidth = typingText.offsetWidth;
    let totalWidth = textWidth;

    if (icon) {
      totalWidth += icon.offsetWidth + 16; // 텍스트-아이콘 사이 여유
    }

    if (totalWidth > 0) {
      typingRow.style.width = totalWidth + "px";
      typingBox.style.width = totalWidth + "px";
    }

    // 원래 상태로 복구
    content.textContent = prevText;
  }

  gsap.set(typingText, { opacity: 1, display: "block" });

  const fullText = "네이비베이가 궁금하다면 ?";
  let index = 0;

  function typeNext() {
    if (index < fullText.length) {
      content.textContent += fullText[index];
      index++;
      const delay = gsap.utils.random(0.25, 0.12);
      gsap.delayedCall(delay, typeNext);
    } else {
      // ✅ 끝나면 Click! 으로 교체 + 가운데 정렬
      gsap.to(typingText, {
        opacity: 0,
        duration: 0.7,
        onComplete() {
          cursor.style.opacity = 0;
          content.textContent = "Click!";

          typingText.classList.add("click-target");
          if (typingBox) typingBox.classList.add("click-ready");
          if (typingRow) typingRow.classList.add("click-centered");

          gsap.to(typingText, { opacity: 1, duration: 0.4 });
        }
      });
    }
  }

  typeNext();
}



// sec1 들어오면 실행
ScrollTrigger.create({
  trigger: ".sec1",
  start: "top 15%",
  once: true,
  
  onEnter: playTypingAnimation
});




const menuEl = document.querySelector(".menu");

const hideMenu = gsap.to(menuEl, {
  opacity: 0,
  y: -20,
  duration: 0.3,
  paused: true,
  onStart: () => { if (menuEl) menuEl.style.pointerEvents = "none"; },
  onReverseComplete: () => { if (menuEl) menuEl.style.pointerEvents = "auto"; }
});

// ✅ 핵심: 스크롤 없이도 0px 구간을 즉시 적용
function ensureMenuVisibleAtTop(y) {
  if (!menuEl) return;
  if (y <= 5) {
    // “보임 상태”를 강제로 렌더링 (스크롤 없어도)
    hideMenu.pause(0);                 // 시작 프레임(보임)
    menuEl.style.opacity = "1";
    menuEl.style.transform = "translateY(0px)";
    menuEl.style.pointerEvents = "auto";
  }
}

// ✅ 1) 첫 로드 즉시 실행
ensureMenuVisibleAtTop(window.scrollY || 0);
// ===========================
// 🔒 모바일 초기 클릭 막힘 방지 (FIX)
// ===========================
function forceMenuClickableOnLoad() {
  const menu = document.querySelector(".menu");
  if (!menu) return;

  // 최초 로딩 시 강제로 클릭 가능 상태 보장
  menu.style.pointerEvents = "auto";
  menu.style.opacity = "1";
  menu.style.transform = "translateY(0)";
}

// DOM 로드 직후 1회
window.addEventListener("load", () => {
  forceMenuClickableOnLoad();
});

// 모바일 주소창/렌더링 지연 대응 (안전망)
setTimeout(forceMenuClickableOnLoad, 300);


// ✅ 2) ScrollTrigger refresh 시점에도 실행 (로드 직후/리사이즈/폰 주소창 변화 대응)
ScrollTrigger.create({
  start: "top top",
  end: 999999,
  onUpdate(self) { ensureMenuVisibleAtTop(self.scroll()); },
  onRefresh(self) { ensureMenuVisibleAtTop(self.scroll()); }
});

// ✅ 3) iOS/크롬 bfcache(뒤로가기 복귀) 대응
window.addEventListener("pageshow", () => {
  ensureMenuVisibleAtTop(window.scrollY || 0);
});












/* ============================================
   📱 모바일에서 스크롤 멈춤(핀 구간) 확장
   sec3 / sec4 / sec5 전용
============================================ */
ScrollTrigger.matchMedia({

  "(max-width: 768px)": function () {


// ✅ mosec4 브레이크(핀) - 리사이즈/주소창 변화에도 안전하게
const oldBrake = ScrollTrigger.getById("mo-sec4-brake");
if (oldBrake) oldBrake.kill(true);

ScrollTrigger.create({
  id: "mo-sec4-brake",
  trigger: ".mosec4",
  start: "top top",
  end: () => "+=" + Math.round(window.innerHeight * 1.2),
  pin: true,
  pinSpacing: true,
  scrub: true,
  anticipatePin: 1,
  invalidateOnRefresh: true
});


    /* --- SEC5 모바일 pin 길이 증가 --- */
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger && st.trigger.classList.contains("sec5")) {
        st.vars.end = "+=" + window.innerHeight * 2.2;
        st.refresh();
      }
    });

  }

});




const sec15Circles = gsap.utils.toArray(".sec15 .value-circle");

if (sec15Circles.length) {
  // 회전 기준을 원의 정중앙으로
  gsap.set(sec15Circles, { transformOrigin: "50% 50%", rotation: 0 });

  const sec15Tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".sec15",
      start: "top 80%",
      end: "bottom top",
      toggleActions: "play pause resume pause"
    },
    repeat: -1   // 계속 순환
  });

  // 품질 → 신뢰 → 혁신 순서로 한 바퀴씩
  sec15Circles.forEach((circle) => {
    sec15Tl.to(circle, {
      rotation: "+=360",
      duration: 2.4,
      ease: "none"
    });
  });
}




function blockWhenTransparent(el, threshold = 0.01) {
  if (!el) return;

  const apply = () => {
    const s = getComputedStyle(el);
    const op = parseFloat(s.opacity || "1");
    const hidden = (s.display === "none") || (s.visibility === "hidden") || (op <= threshold);
    el.style.pointerEvents = hidden ? "none" : "auto";
  };

  apply();

  // style/class 변하면 다시 체크
  const mo = new MutationObserver(apply);
  mo.observe(el, { attributes: true, attributeFilter: ["style", "class"] });

  window.addEventListener("resize", apply);
  window.addEventListener("scroll", apply, { passive: true });
}




});



