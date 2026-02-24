// src/lib/saju/engine.ts — 만세력 엔진 메인

import type { SajuInput, SajuResult, Pillar } from "./types";
import { getCalendarInfo } from "./calendar";
import { getCheonganByHanja, getJijiByHanja } from "./constants";
import { calculateSipseong } from "./sipseong";
import { calculateUnseong } from "./unseong";
import { calculateOheng } from "./oheng";
import { findInteractions } from "./interactions";
import { findSinsals } from "./sinsal";
import { calculateDaeun, calculateSeun } from "./daeun";
import { calculateYongsin, isDayMasterStrong } from "./yongsin";
import { determineGeokGuk } from "./geokguk";

/**
 * 만세력 엔진 메인 함수
 *
 * 입력(생년월일시, 성별, 역법) → SajuResult (전체 사주 분석 데이터)
 *
 * 계산 순서:
 * 1. 양력↔음력 변환 + 절기 판별 + 4기둥 간지 추출 (lunar-javascript)
 * 2. 지장간 추출
 * 3. 십성 계산
 * 4. 12운성 계산
 * 5. 오행 분포
 * 6. 합충형파해
 * 7. 신살
 * 8. 일간 강약 + 용신/기신
 * 9. 대운
 * 10. 세운
 */
export function calculateSaju(input: SajuInput): SajuResult {
  // ─── [1] 역법 변환 + 4기둥 추출 ───
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);

  const calendar = getCalendarInfo(
    year,
    month,
    day,
    hour,
    minute,
    input.calendarType,
    input.isLeapMonth
  );

  // Pillar 객체 구성
  const makePillar = (gan: string, ji: string): Pillar => {
    const ganInfo = getCheonganByHanja(gan);
    const jiInfo = getJijiByHanja(ji);
    if (!ganInfo || !jiInfo) throw new Error(`Invalid ganji: ${gan}${ji}`);
    return { gan, ji, ganInfo, jiInfo };
  };

  const pillars = {
    year: makePillar(calendar.pillars.year.gan, calendar.pillars.year.ji),
    month: makePillar(calendar.pillars.month.gan, calendar.pillars.month.ji),
    day: makePillar(calendar.pillars.day.gan, calendar.pillars.day.ji),
    hour: makePillar(calendar.pillars.hour.gan, calendar.pillars.hour.ji),
  };

  const dayGan = pillars.day.gan;

  // ─── [2] 지장간 추출 ───
  const jijanggan = {
    yearJi: pillars.year.jiInfo.jijanggan,
    monthJi: pillars.month.jiInfo.jijanggan,
    dayJi: pillars.day.jiInfo.jijanggan,
    hourJi: pillars.hour.jiInfo.jijanggan,
  };

  // ─── [3] 십성 계산 ───
  const sipseong = calculateSipseong(dayGan, pillars, jijanggan);

  // ─── [4] 12운성 계산 ───
  const unseong = calculateUnseong(
    dayGan,
    pillars.year.ji,
    pillars.month.ji,
    pillars.day.ji,
    pillars.hour.ji
  );

  // ─── [5] 오행 분포 ───
  const oheng = calculateOheng(pillars, jijanggan);

  // ─── [6] 합충형파해 + 천간합충 ───
  const interactions = findInteractions(
    pillars.year.ji,
    pillars.month.ji,
    pillars.day.ji,
    pillars.hour.ji,
    pillars.year.gan,
    pillars.month.gan,
    pillars.day.gan,
    pillars.hour.gan
  );

  // ─── [7] 신살 ───
  const sinsals = findSinsals(
    dayGan,
    pillars.year.ji,
    pillars.month.ji,
    pillars.day.ji,
    pillars.hour.ji
  );

  // ─── [8] 일간 강약 + 용신/기신 ───
  const { isStrong, reason, scoring } = isDayMasterStrong(dayGan, pillars, pillars.month.ji);

  const dayMasterInfo = getCheonganByHanja(dayGan)!;
  const dayMaster = {
    gan: dayGan,
    element: dayMasterInfo.element,
    yinYang: dayMasterInfo.yinYang,
    nature: dayMasterInfo.nature,
    isStrong,
    strengthReason: reason,
    strengthScoring: scoring,
  };

  const yongsin = calculateYongsin(dayGan, pillars, oheng);

  // ─── [8.5] 격국 판별 ───
  const geokguk = determineGeokGuk(dayGan, pillars.month);

  // ─── [9] 대운 ───
  const solarYear = calendar.solar.year;
  const solarMonth = calendar.solar.month;
  const solarDay = calendar.solar.day;

  const daeun = calculateDaeun(
    solarYear,
    solarMonth,
    solarDay,
    hour,
    minute,
    input.gender,
    dayGan,
    "solar", // 대운 계산은 항상 양력 기준
    false,
    2026
  );

  // ─── [10] 세운 ───
  const natalJiList = [pillars.year.ji, pillars.month.ji, pillars.day.ji, pillars.hour.ji];
  const seun = calculateSeun(2026, dayGan, natalJiList);

  // ─── 최종 결과 조립 ───
  return {
    input,
    lunar: calendar.lunar,
    jeolgi: calendar.jeolgi,
    pillars,
    dayMaster,
    sipseong,
    unseong,
    oheng,
    yongsin,
    geokguk,
    interactions,
    sinsals,
    daeun,
    seun,
    jijanggan,
  };
}
