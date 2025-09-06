// 지원하는 통화 코드 타입 정의
export type CurrencyCode =
  | 'KRW'
  | 'USD'
  | 'JPY'
  | 'EUR'
  | 'CNY'
  | 'THB'
  | 'VND'
  | 'SGD'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'TWD'
  | 'HKD'
  | 'MYR'
  | 'PHP'
  | 'IDR';

// 통화 정보 인터페이스
export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string; // 통화 기호 (₩, $, ¥ 등)
  name: string; // 통화명 (원, 달러, 엔 등)
  locale: string; // 로케일 정보 (ko-KR, en-US 등)
  decimals: number; // 소수점 자릿수
}

// 지원하는 모든 통화 정보 정의
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  KRW: { code: 'KRW', symbol: '₩', name: '원', locale: 'ko-KR', decimals: 0 },
  USD: { code: 'USD', symbol: '$', name: '달러', locale: 'en-US', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: '엔', locale: 'ja-JP', decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', name: '유로', locale: 'de-DE', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: '위안', locale: 'zh-CN', decimals: 2 },
  THB: { code: 'THB', symbol: '฿', name: '바트', locale: 'th-TH', decimals: 2 },
  VND: { code: 'VND', symbol: '₫', name: '동', locale: 'vi-VN', decimals: 0 },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: '싱가포르 달러',
    locale: 'en-SG',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: '파운드',
    locale: 'en-GB',
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: '캐나다 달러',
    locale: 'en-CA',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: '호주 달러',
    locale: 'en-AU',
    decimals: 2,
  },
  TWD: {
    code: 'TWD',
    symbol: 'NT$',
    name: '신 타이완 달러',
    locale: 'zh-TW',
    decimals: 0,
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: '홍콩 달러',
    locale: 'en-HK',
    decimals: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: '링깃',
    locale: 'ms-MY',
    decimals: 2,
  },
  PHP: { code: 'PHP', symbol: '₱', name: '페소', locale: 'en-PH', decimals: 2 },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: '루피아',
    locale: 'id-ID',
    decimals: 0,
  },
};

// 국가/지역별 기본 화폐 매핑 (여행지 자동 통화 설정용)
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  // 아시아
  한국: 'KRW',
  일본: 'JPY',
  중국: 'CNY',
  태국: 'THB',
  베트남: 'VND',
  싱가포르: 'SGD',
  대만: 'TWD',
  홍콩: 'HKD',
  말레이시아: 'MYR',
  필리핀: 'PHP',
  인도네시아: 'IDR',

  // 유럽
  독일: 'EUR',
  프랑스: 'EUR',
  이탈리아: 'EUR',
  스페인: 'EUR',
  네덜란드: 'EUR',
  오스트리아: 'EUR',
  벨기에: 'EUR',
  포르투갈: 'EUR',
  그리스: 'EUR',
  아일랜드: 'EUR',
  영국: 'GBP',

  // 북미
  미국: 'USD',
  캐나다: 'CAD',

  // 오세아니아
  호주: 'AUD',
  뉴질랜드: 'USD', // 간단히 USD로 설정
};

/**
 * 국가명으로부터 화폐 코드를 추출합니다
 * 여행지 위치 정보를 바탕으로 기본 통화를 자동 설정
 * @param location - 국가명 또는 지역명 (예: "일본", "일본 도쿄")
 * @returns 해당 국가의 기본 통화 코드
 */
export function getCurrencyFromLocation(location: string): CurrencyCode {
  // 정확한 매치 먼저 확인
  if (COUNTRY_CURRENCY_MAP[location]) {
    return COUNTRY_CURRENCY_MAP[location];
  }

  // 부분 매치 확인 (예: "일본 도쿄" -> "일본")
  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (location.includes(country)) {
      return currency;
    }
  }

  // 기본값은 한국 원화
  return 'KRW';
}

/**
 * 화폐 금액을 포맷팅합니다
 * Intl.NumberFormat을 사용하여 로케일에 맞는 통화 표시
 * @param amount - 포맷팅할 금액
 * @param currency - 통화 코드
 * @returns 포맷팅된 통화 문자열
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const currencyInfo = CURRENCIES[currency];

  try {
    // Intl.NumberFormat을 사용한 표준 통화 포맷팅
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    }).format(amount);
  } catch (error) {
    console.error(error);

    // Fallback: 심볼 + 숫자 (Intl.NumberFormat 실패 시)
    const formattedNumber = amount.toLocaleString('ko-KR', {
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    });
    return `${currencyInfo.symbol}${formattedNumber}`;
  }
}

/**
 * 화폐 입력값을 포맷팅합니다 (입력 필드용)
 * 사용자가 입력한 숫자를 천 단위 구분자와 함께 표시
 * @param value - 사용자 입력값
 * @param currency - 통화 코드
 * @returns 포맷팅된 입력값
 */
export function formatCurrencyInput(value: string): string {
  // 숫자가 아닌 문자 제거
  const numbers = value.replace(/[^0-9]/g, '');
  if (!numbers) return '';

  const amount = parseInt(numbers);

  // 천 단위 구분자 추가
  return amount.toLocaleString('ko-KR');
}

/**
 * 포맷팅된 화폐 문자열에서 숫자만 추출합니다
 * 천 단위 구분자나 통화 기호를 제거하고 순수 숫자만 반환
 * @param value - 포맷팅된 통화 문자열
 * @returns 숫자 값
 */
export function parseCurrencyInput(value: string): number {
  // 숫자가 아닌 문자 제거
  const numbers = value.replace(/[^0-9]/g, '');
  return numbers ? parseInt(numbers) : 0;
}
