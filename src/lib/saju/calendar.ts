// src/lib/saju/calendar.ts — 음양력 변환 (lunar-javascript 래퍼)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar } = require("lunar-javascript");

export interface CalendarInfo {
  solar: { year: number; month: number; day: number; hour: number; minute: number };
  lunar: { year: number; month: number; day: number; isLeapMonth: boolean };
  pillars: {
    year: { gan: string; ji: string };
    month: { gan: string; ji: string };
    day: { gan: string; ji: string };
    hour: { gan: string; ji: string };
  };
  jeolgi: {
    name: string;
    date: string;
    isBeforeJeolgi: boolean;
  };
}

// 절기 중국어 → 한국어 매핑
const JEOLGI_MAP: Record<string, string> = {
  小寒: "소한", 大寒: "대한", 立春: "입춘", 雨水: "우수",
  惊蛰: "경칩", 春分: "춘분", 清明: "청명", 谷雨: "곡우",
  立夏: "입하", 小满: "소만", 芒种: "망종", 夏至: "하지",
  小暑: "소서", 大暑: "대서", 立秋: "입추", 处暑: "처서",
  白露: "백로", 秋分: "추분", 寒露: "한로", 霜降: "상강",
  立冬: "입동", 小雪: "소설", 大雪: "대설", 冬至: "동지",
};

/**
 * 양력 날짜+시간으로부터 사주 계산에 필요한 모든 역법 정보를 추출
 */
export function getCalendarInfo(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  calendarType: "solar" | "lunar" = "solar",
  isLeapMonth: boolean = false
): CalendarInfo {
  let solarObj;

  if (calendarType === "lunar") {
    // 음력 → 양력 변환
    const lunarMonth = isLeapMonth ? -month : month;
    const lunarObj = Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, 0);
    solarObj = lunarObj.getSolar();
  } else {
    solarObj = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  }

  const lunarObj = solarObj.getLunar();
  const eightChar = lunarObj.getEightChar();

  // 절기 정보
  const prevJie = lunarObj.getPrevJie();
  const prevJieName = prevJie ? prevJie.getName() : "";
  const prevJieSolar = prevJie ? prevJie.getSolar() : null;

  // 현재 날짜의 절기 확인
  const currentJieQi = lunarObj.getCurrentJieQi();
  const isBeforeJeolgi = false; // 이미 eightChar가 절기 기준으로 계산함

  return {
    solar: {
      year: solarObj.getYear(),
      month: solarObj.getMonth(),
      day: solarObj.getDay(),
      hour: solarObj.getHour(),
      minute: solarObj.getMinute(),
    },
    lunar: {
      year: lunarObj.getYear(),
      month: Math.abs(lunarObj.getMonth()),
      day: lunarObj.getDay(),
      isLeapMonth: lunarObj.getMonth() < 0,
    },
    pillars: {
      year: { gan: eightChar.getYearGan(), ji: eightChar.getYearZhi() },
      month: { gan: eightChar.getMonthGan(), ji: eightChar.getMonthZhi() },
      day: { gan: eightChar.getDayGan(), ji: eightChar.getDayZhi() },
      hour: { gan: eightChar.getTimeGan(), ji: eightChar.getTimeZhi() },
    },
    jeolgi: {
      name: currentJieQi
        ? JEOLGI_MAP[currentJieQi.getName()] || currentJieQi.getName()
        : JEOLGI_MAP[prevJieName] || prevJieName,
      date: prevJieSolar ? prevJieSolar.toYmd() : "",
      isBeforeJeolgi,
    },
  };
}

/**
 * 대운 계산용: lunar-javascript의 Yun(운) 객체 반환
 */
export function getYun(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: "male" | "female",
  calendarType: "solar" | "lunar" = "solar",
  isLeapMonth: boolean = false
) {
  let solarObj;

  if (calendarType === "lunar") {
    const lunarMonth = isLeapMonth ? -month : month;
    const lunarObj = Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, 0);
    solarObj = lunarObj.getSolar();
  } else {
    solarObj = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  }

  const lunarObj = solarObj.getLunar();
  const eightChar = lunarObj.getEightChar();

  // gender: 1=male, 0=female (lunar-javascript convention)
  const genderNum = gender === "male" ? 1 : 0;
  return eightChar.getYun(genderNum);
}

/**
 * 특정 연도의 간지를 반환
 */
export function getYearGanJi(year: number): { gan: string; ji: string } {
  const solarObj = Solar.fromYmd(year, 6, 1); // 해당 연도 중간쯤
  const lunarObj = solarObj.getLunar();
  const ec = lunarObj.getEightChar();
  return { gan: ec.getYearGan(), ji: ec.getYearZhi() };
}

/**
 * 특정 연도의 세운(歲運) 간지를 반환
 */
export function getSeunGanJi(year: number): { gan: string; ji: string } {
  // 세운은 해당 연도의 연간지
  const solarObj = Solar.fromYmdHms(year, 6, 15, 12, 0, 0);
  const lunarObj = solarObj.getLunar();
  return {
    gan: lunarObj.getYearGanByLiChun(),
    ji: lunarObj.getYearZhiByLiChun(),
  };
}
