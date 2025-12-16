// include/sec15.js

window.initSec15 = function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const root = "#sec15-load";
  const sec = document.querySelector(`${root} .sec15`);
  const circles = gsap.utils.toArray(`${root} .sec15 .value-circle`);
  if (!sec || !circles.length) return;

  // (재주입/리프레시 대비) 기존 트리거/애니메이션 정리
  const oldFlip = ScrollTrigger.getById("sec15-flip");
  if (oldFlip) oldFlip.kill(true);

  // 3D 플립 준비
  gsap.set(circles, {
    transformPerspective: 900,
    transformStyle: "preserve-3d",
    rotationX: 0,
    willChange: "transform",
  });

  // 제자리에서 X축 360도 뒤집히는 효과(순차)
  const tl = gsap.timeline({ paused: true, repeat: -1 ,repeatDelay: 3});
  tl.to(circles, {
    rotationY: "+=360",
    duration: 1.6,
    ease: "power2.inOut",
    stagger: 0.22,
  });

  ScrollTrigger.create({
    id: "sec15-flip",
    trigger: sec,
    start: "top 80%",
    end: "bottom top",
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  });
};
