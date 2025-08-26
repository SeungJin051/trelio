/**
 * 환율 API 연동 서비스
 * fxratesapi.com을 사용하여 실시간 환율 정보를 가져옵니다.
 * 완전 무료, API 키 불필요
 */

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface ConversionResponse {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  date: string;
  result: number;
}

// 환율 캐시 (1시간 유효)
const exchangeRateCache = new Map<
  string,
  { data: ExchangeRateResponse; timestamp: number }
>();
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

/**
 * 기본 환율 정보를 가져옵니다 (USD 기준)
 * @param baseCurrency - 기준 통화 (기본값: USD)
 * @returns 환율 정보
 */
export const getExchangeRates = async (
  baseCurrency = 'USD'
): Promise<ExchangeRateResponse> => {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = exchangeRateCache.get(cacheKey);

  // 캐시가 유효한 경우 캐시된 데이터 반환
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // fxratesapi.com은 완전 무료로 API 키 불필요
    const response = await fetch(
      `https://api.fxratesapi.com/latest?base=${baseCurrency}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`환율 API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    // fxratesapi.com 응답을 ExchangeRateResponse 형식으로 변환
    const transformedData: ExchangeRateResponse = {
      success: data.success !== false,
      base: data.base || baseCurrency,
      date: data.date
        ? data.date.split('T')[0]
        : new Date().toISOString().split('T')[0],
      rates: data.rates || {},
      timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(),
    };

    if (!transformedData.success) {
      throw new Error('환율 API에서 오류가 발생했습니다.');
    }

    // 캐시에 저장
    exchangeRateCache.set(cacheKey, {
      data: transformedData,
      timestamp: Date.now(),
    });

    return transformedData;
  } catch (error) {
    console.error('환율 정보 가져오기 실패:', error);

    // 캐시된 데이터가 있으면 만료되었어도 반환
    if (cached) {
      console.warn('캐시된 환율 데이터를 사용합니다.');
      return cached.data;
    }

    // 환율 데이터를 가져올 수 없으면 기본값 반환
    console.warn('환율 정보를 사용할 수 없습니다. 기본값을 반환합니다.');
    return {
      success: false,
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: {},
      timestamp: Date.now(),
    };
  }
};

/**
 * 특정 금액을 다른 통화로 변환합니다
 * @param amount - 변환할 금액
 * @param fromCurrency - 원본 통화
 * @param toCurrency - 대상 통화
 * @returns 변환된 금액
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    // fxratesapi.com을 사용하여 환율 정보 먼저 가져오기 (변환 API 없으므로)
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (rate) {
      return amount * rate;
    }

    // 역방향 시도 (toCurrency 기준으로)
    const reverseRates = await getExchangeRates(toCurrency);
    const reverseRate = reverseRates.rates[fromCurrency];

    if (reverseRate) {
      return amount / reverseRate;
    }

    throw new Error(
      `${fromCurrency}에서 ${toCurrency}로의 환율을 찾을 수 없습니다.`
    );
  } catch (error) {
    console.error('환율 변환 실패:', error);

    // 폴백: 기본 환율로 수동 계산
    try {
      const rates = await getExchangeRates(fromCurrency);
      const rate = rates.rates[toCurrency];

      if (rate) {
        return amount * rate;
      }
    } catch (fallbackError) {
      console.error('폴백 환율 계산도 실패:', fallbackError);
    }

    // 모든 환율 변환이 실패하면 원래 금액 반환
    console.warn('환율 변환을 건너뛰고 원래 금액을 반환합니다.');
    return amount;
  }
};

/**
 * 사용자 국적에 따른 기본 통화를 반환합니다
 * @param nationality - 사용자 국적 (ISO 3166-1 alpha-3)
 * @returns 통화 코드
 */
export const getCurrencyByNationality = (nationality?: string): string => {
  // 자주 쓰는 국가명(한글/영문) → ISO2 코드 간단 매핑
  const nameToAlpha2: Record<string, string> = {
    대한민국: 'KR',
    한국: 'KR',
    'Korea, Republic of': 'KR',
    'South Korea': 'KR',
    일본: 'JP',
    Japan: 'JP',
    미국: 'US',
    'United States': 'US',
    USA: 'US',
    중국: 'CN',
    China: 'CN',
    영국: 'GB',
    'United Kingdom': 'GB',
    영연방: 'GB',
    독일: 'DE',
    Germany: 'DE',
    프랑스: 'FR',
    France: 'FR',
    캐나다: 'CA',
    Canada: 'CA',
    호주: 'AU',
    Australia: 'AU',
  };
  // ISO2(국가코드) → ISO4217(통화) 매핑
  const alpha2ToCurrency: Record<string, string> = {
    KR: 'KRW',
    US: 'USD',
    JP: 'JPY',
    CN: 'CNY',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    AU: 'AUD',
    CA: 'CAD',
    CH: 'CHF',
    SG: 'SGD',
    HK: 'HKD',
    TW: 'TWD',
    TH: 'THB',
    VN: 'VND',
    MY: 'MYR',
    ID: 'IDR',
    PH: 'PHP',
    IN: 'INR',
  };

  // ISO3(국가코드) → ISO4217(통화) 매핑
  const alpha3ToCurrency: Record<string, string> = {
    KOR: 'KRW',
    USA: 'USD',
    JPN: 'JPY',
    CHN: 'CNY',
    GBR: 'GBP',
    DEU: 'EUR',
    FRA: 'EUR',
    ITA: 'EUR',
    ESP: 'EUR',
    AUS: 'AUD',
    CAN: 'CAD',
    CHE: 'CHF',
    SGP: 'SGD',
    HKG: 'HKD',
    TWN: 'TWD',
    THA: 'THB',
    VNM: 'VND',
    MYS: 'MYR',
    IDN: 'IDR',
    PHL: 'PHP',
    IND: 'INR',
  };

  // 국가명이 들어오는 경우를 우선 처리
  const byName = nationality && nameToAlpha2[nationality.trim()];
  const code = (byName || nationality)?.toUpperCase();
  if (!code) return 'KRW';

  if (code.length === 2) {
    return alpha2ToCurrency[code] || 'KRW';
  }
  if (code.length === 3) {
    return alpha3ToCurrency[code] || 'KRW';
  }
  return 'KRW';
};

/**
 * 목적지 국가에 따른 통화를 반환합니다
 * @param destinationCountry - 목적지 국가 (ISO 3166-1 alpha-3)
 * @returns 통화 코드
 */
export const getCurrencyByDestination = (
  destinationCountry?: string
): string => {
  // 목적지 코드가 countriesISO의 ISO2 코드이므로 우선 ISO2 매핑을 시도
  return getCurrencyByNationality(destinationCountry);
};

/**
 * 통화 포맷팅 (천 단위 구분, 소수점 처리)
 * @param amount - 금액
 * @param currency - 통화 코드
 * @returns 포맷된 금액 문자열
 */
export const formatCurrencyWithExchange = (
  amount: number,
  currency: string
): string => {
  const currencySymbols: Record<string, string> = {
    KRW: '₩',
    USD: '$',
    JPY: '¥',
    CNY: '¥',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    SGD: 'S$',
    HKD: 'HK$',
    TWD: 'NT$',
    THB: '฿',
    VND: '₫',
    MYR: 'RM',
    IDR: 'Rp',
    PHP: '₱',
    INR: '₹',
  };

  const symbol = currencySymbols[currency] || currency;

  // 통화별 소수점 처리
  const decimalPlaces = ['KRW', 'JPY', 'VND', 'IDR'].includes(currency) ? 0 : 2;

  const formattedAmount = amount.toLocaleString('ko-KR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return `${symbol}${formattedAmount}`;
};

/**
 * 환율 정보와 함께 예산 현황을 계산합니다
 * @param targetBudget - 목표 예산
 * @param budgetCurrency - 예산 통화
 * @param userCurrency - 사용자 통화
 * @param spentAmount - 사용된 금액 (예산 통화 기준)
 * @returns 변환된 예산 정보
 */
export const calculateBudgetWithExchange = async (
  targetBudget: number,
  budgetCurrency: string,
  userCurrency: string,
  spentAmount: number = 0
): Promise<{
  targetBudgetInUserCurrency: number;
  spentAmountInUserCurrency: number;
  remainingBudgetInUserCurrency: number;
  exchangeRate: number;
  budgetCurrency: string;
  userCurrency: string;
}> => {
  try {
    // 사용자 통화로 변환
    const targetBudgetInUserCurrency = await convertCurrency(
      targetBudget,
      budgetCurrency,
      userCurrency
    );

    const spentAmountInUserCurrency = await convertCurrency(
      spentAmount,
      budgetCurrency,
      userCurrency
    );

    const remainingBudgetInUserCurrency =
      targetBudgetInUserCurrency - spentAmountInUserCurrency;

    // 환율 계산 (1 budgetCurrency = ? userCurrency)
    const exchangeRate = targetBudgetInUserCurrency / targetBudget;

    return {
      targetBudgetInUserCurrency,
      spentAmountInUserCurrency,
      remainingBudgetInUserCurrency,
      exchangeRate,
      budgetCurrency,
      userCurrency,
    };
  } catch (error) {
    console.error('예산 환율 계산 실패:', error);

    // 실패 시 원본 데이터 반환
    return {
      targetBudgetInUserCurrency: targetBudget,
      spentAmountInUserCurrency: spentAmount,
      remainingBudgetInUserCurrency: targetBudget - spentAmount,
      exchangeRate: 1,
      budgetCurrency,
      userCurrency: budgetCurrency,
    };
  }
};
