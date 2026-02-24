// src/lib/saju/geokguk.ts — 격국(格局) 판별
//
// 격국은 월지의 정기(본기 = 첫 번째 지장간)와 일간의 십성 관계로 결정.
// 단, 비견/겁재인 경우 건록격/양인격으로 분류.

import type { GeokGuk, GeokGukName, Pillar } from "./types";
import { getJijiByHanja } from "./constants";
import { getSipseong } from "./sipseong";

// 십성 → 격국명 매핑
const SIPSEONG_TO_GEOKGUK: Record<string, GeokGukName> = {
  정관: "정관격",
  편관: "편관격",
  정인: "정인격",
  편인: "편인격",
  식신: "식신격",
  상관: "상관격",
  정재: "정재격",
  편재: "편재격",
  비견: "건록격", // 비견 → 건록격
  겁재: "양인격", // 겁재 → 양인격
};

/**
 * 격국(格局) 판별
 *
 * 월지 정기(본기)의 천간과 일간의 십성 관계에 따라 격국 결정.
 * - 비견 → 건록격
 * - 겁재 → 양인격
 * - 그 외 → 해당 십성격
 */
export function determineGeokGuk(
  dayGan: string,
  monthPillar: Pillar
): GeokGuk {
  const monthJiInfo = getJijiByHanja(monthPillar.ji);
  if (!monthJiInfo) throw new Error(`Unknown month ji: ${monthPillar.ji}`);

  // 월지의 정기(본기) = 첫 번째 지장간
  const monthMainGan = monthJiInfo.jijanggan[0];
  const sipseong = getSipseong(dayGan, monthMainGan);
  const geokgukName = SIPSEONG_TO_GEOKGUK[sipseong];

  let basis: string;
  if (sipseong === "비견") {
    basis = `월지 ${monthPillar.ji}의 정기 ${monthMainGan} → 일간과 비견(같은 오행+같은 음양)이므로 건록격`;
  } else if (sipseong === "겁재") {
    basis = `월지 ${monthPillar.ji}의 정기 ${monthMainGan} → 일간과 겁재(같은 오행+다른 음양)이므로 양인격`;
  } else {
    basis = `월지 ${monthPillar.ji}의 정기 ${monthMainGan} → 일간과 ${sipseong} 관계이므로 ${geokgukName}`;
  }

  return {
    name: geokgukName,
    basis,
    monthMainGan,
    monthMainSipseong: sipseong,
  };
}
