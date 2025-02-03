document.addEventListener("DOMContentLoaded", () => {
  /**
        Lenis & Gsap 配置
    */

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  /*
          gsap.ticker.add() 允许我们在每一帧执行特定的代码。
          lenis.raf(time * 1000); 使 Lenis 使用 GSAP 的时间戳来更新动画。
        */
  gsap.ticker.lagSmoothing(0);
  //   禁用 GSAP 的滞后平滑（lag smoothing）功能

  /**
   * 设置（gsap.set）每张卡片初始位置以及角度
   */

  const cards = gsap.utils.toArray(".card");
  const rotations = [-12, 10, -5, 5, -5, -2];
  cards.forEach((card, index) => {
    gsap.set(card, {
      y: window.innerHeight,
      rotate: rotations[index],
    });
  });

  /**
   *
   * 滚动动画
   */

  ScrollTrigger.create({
    trigger: ".sticky-cards",
    start: "top top",
    end: `+=${window.innerHeight * 8}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: ({ progress }) => {
      const totalCards = cards.length;
      const progressPerCard = 1 / totalCards;
      cards.forEach((card, index) => {
        const cardStart = index * progressPerCard;
        // 此时完成自己进度的占比
        let cardProgress = (progress - cardStart) / progressPerCard;
        cardProgress = Math.min(Math.max(cardProgress, 0), 1);
        let yPos = window.innerHeight * (1 - cardProgress);
        let xPos = 0;
        // 处理卡片滚动到屏幕顶端后，继续向左上角移动的动画效果。
        if (cardProgress === 1 && index < totalCards - 1) {
          const remainingProgress =
            (progress - (cardStart + progressPerCard)) /
            (1 - (cardStart + progressPerCard));

          if (remainingProgress > 0) {
            const distanceMultiplier = 1 - index * 0.15;
            xPos =
              -window.innerWidth * 0.3 * distanceMultiplier * remainingProgress;
            yPos =
              -window.innerHeight *
              0.3 *
              distanceMultiplier *
              remainingProgress;
          }
        }

        gsap.to(card, {
          y: yPos,
          x: xPos,
          duration: 0,
          ease: "none",
        });
      });
    },
  });
});
