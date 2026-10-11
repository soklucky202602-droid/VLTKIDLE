"use strict";
// Global skill damage boost: active skills deal 2x damage.
(function () {
  const SKILL_DMG_MULT = 2;
  const baseCalc = calc;
  calc = function (eq) {
    const P = baseCalc(eq);
    if (!P || !Array.isArray(P.actives)) return P;
    for (const a of P.actives) {
      if (!a || !a.parts) continue;
      for (const e in a.parts) a.parts[e] *= SKILL_DMG_MULT;
      a.tot *= SKILL_DMG_MULT;
      a.dps *= SKILL_DMG_MULT;
    }
    return P;
  };
})();
