"use strict";
// Tăng sát thương độc của mọi kỹ năng/đòn đánh có thành phần poison.
// Không tăng sát thương vật lý hay các hệ khác.
(() => {
  const POISON_DMG_MULT = 3;
  if (typeof window.heroHit !== "function" || window.__poisonDamageBoosted) return;
  const originalHeroHit = window.heroHit;
  window.heroHit = function (a, e) {
    if (!a || !a.parts || a.parts.poison == null) return originalHeroHit(a, e);
    const old = a.parts.poison;
    a.parts.poison = old * POISON_DMG_MULT;
    try {
      return originalHeroHit(a, e);
    } finally {
      a.parts.poison = old;
    }
  };
  window.__poisonDamageBoosted = true;
})();
