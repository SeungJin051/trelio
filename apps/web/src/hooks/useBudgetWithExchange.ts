import { useCallback, useEffect, useState } from 'react';

import {
  calculateBudgetWithExchange,
  convertCurrency,
  formatCurrencyWithExchange,
  getCurrencyByDestination,
  getCurrencyByNationality,
} from '@/lib/exchange-rate';

interface UseBudgetWithExchangeProps {
  planId: string;
  targetBudget: number;
  budgetCurrency: string;
  destinationCountry?: string;
  userNationality?: string;
}

interface BudgetInfo {
  targetBudget: number;
  spentAmount: number;
  remainingBudget: number;
  currency: string;
  originalCurrency: string;
  exchangeRate: number;
  spentPercentage: number;
  formattedTargetBudget: string;
  formattedSpentAmount: string;
  formattedRemainingBudget: string;
  // 원래 통화로 표시할 예산 정보
  originalBudgetInfo: {
    targetBudget: number;
    spentAmount: number;
    remainingBudget: number;
    formattedTargetBudget: string;
    formattedSpentAmount: string;
    formattedRemainingBudget: string;
  };
  // 현지 통화별 사용 금액 분석
  localSpending: {
    totalInOriginalCurrency: number;
    totalInUserCurrency: number;
    formattedTotalInOriginalCurrency: string;
    formattedTotalInUserCurrency: string;
    breakdownByCurrency: Array<{
      currency: string;
      amount: number;
      convertedAmount: number;
      formattedAmount: string;
      formattedConvertedAmount: string;
      exchangeRate: number;
    }>;
  };
}

interface UseBudgetWithExchangeReturn {
  budgetInfo: BudgetInfo;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 예산 현황을 사용자 통화로 변환하여 관리하는 훅
 */
export const useBudgetWithExchange = ({
  planId,
  targetBudget,
  budgetCurrency,
  destinationCountry,
  userNationality,
}: UseBudgetWithExchangeProps): UseBudgetWithExchangeReturn => {
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo>({
    targetBudget: 0,
    spentAmount: 0,
    remainingBudget: 0,
    currency: 'KRW',
    originalCurrency: 'KRW',
    exchangeRate: 1,
    spentPercentage: 0,
    formattedTargetBudget: '₩0',
    formattedSpentAmount: '₩0',
    formattedRemainingBudget: '₩0',
    originalBudgetInfo: {
      targetBudget: 0,
      spentAmount: 0,
      remainingBudget: 0,
      formattedTargetBudget: '₩0',
      formattedSpentAmount: '₩0',
      formattedRemainingBudget: '₩0',
    },
    localSpending: {
      totalInOriginalCurrency: 0,
      totalInUserCurrency: 0,
      formattedTotalInOriginalCurrency: '₩0',
      formattedTotalInUserCurrency: '₩0',
      breakdownByCurrency: [],
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 통화 결정
  const getUserCurrency = useCallback(() => {
    return getCurrencyByNationality(userNationality);
  }, [userNationality]);

  // 목적지 통화 결정 (예산이 설정되지 않은 경우)
  const getDestinationCurrency = useCallback(() => {
    return getCurrencyByDestination(destinationCountry);
  }, [destinationCountry]);

  // 실제 사용된 금액 계산 및 통화별 분석
  const calculateSpentAmount = useCallback(async (): Promise<{
    totalInUserCurrency: number;
    localSpending: BudgetInfo['localSpending'];
  }> => {
    try {
      const response = await fetch(`/api/blocks?planId=${planId}`);
      if (response.ok) {
        const data = await response.json();
        const blocks = data.blocks || [];

        // 블록들의 비용을 통화별로 분석하고 사용자 통화로 변환
        const userCurrency = getUserCurrency();
        const originalCurrency = budgetCurrency || getDestinationCurrency();

        // 통화별 사용 금액 집계 (배치 변환)
        const currencyTotals = new Map<string, number>();
        for (const block of blocks) {
          if (block.cost?.amount && block.cost.amount > 0) {
            const blockAmount = block.cost.amount;
            const blockCurrency = block.cost.currency || originalCurrency;
            currencyTotals.set(
              blockCurrency,
              (currencyTotals.get(blockCurrency) || 0) + blockAmount
            );
          }
        }

        // 필요한 통화 집합에 대해 한 번씩만 환율 조회
        const breakdownByCurrency =
          [] as BudgetInfo['localSpending']['breakdownByCurrency'];
        let totalInOriginalCurrency = 0;
        let totalSpentInUserCurrency = 0;
        for (const [currency, amount] of currencyTotals.entries()) {
          try {
            const convertedAmount = await convertCurrency(
              amount,
              currency,
              userCurrency
            );
            const exchangeRate = amount > 0 ? convertedAmount / amount : 1;
            breakdownByCurrency.push({
              currency,
              amount,
              convertedAmount,
              formattedAmount: formatCurrencyWithExchange(amount, currency),
              formattedConvertedAmount: formatCurrencyWithExchange(
                convertedAmount,
                userCurrency
              ),
              exchangeRate,
            });
            totalSpentInUserCurrency += convertedAmount;
            if (currency === originalCurrency)
              totalInOriginalCurrency += amount;
          } catch (error) {
            console.error(`통화별 분석 실패 (${currency}):`, error);
            // 실패 시 변환 없이 원화 추가
            breakdownByCurrency.push({
              currency,
              amount,
              convertedAmount: amount,
              formattedAmount: formatCurrencyWithExchange(amount, currency),
              formattedConvertedAmount: formatCurrencyWithExchange(
                amount,
                userCurrency
              ),
              exchangeRate: 1,
            });
            totalSpentInUserCurrency += amount;
            if (currency === originalCurrency)
              totalInOriginalCurrency += amount;
          }
        }

        const localSpending = {
          totalInOriginalCurrency,
          totalInUserCurrency: totalSpentInUserCurrency,
          formattedTotalInOriginalCurrency: formatCurrencyWithExchange(
            totalInOriginalCurrency,
            originalCurrency
          ),
          formattedTotalInUserCurrency: formatCurrencyWithExchange(
            totalSpentInUserCurrency,
            userCurrency
          ),
          breakdownByCurrency,
        };

        return {
          totalInUserCurrency: totalSpentInUserCurrency,
          localSpending,
        };
      }
      // 데이터 없을 때 기본값 반환
      return {
        totalInUserCurrency: 0,
        localSpending: {
          totalInOriginalCurrency: 0,
          totalInUserCurrency: 0,
          formattedTotalInOriginalCurrency: formatCurrencyWithExchange(
            0,
            budgetCurrency || 'USD'
          ),
          formattedTotalInUserCurrency: formatCurrencyWithExchange(
            0,
            getUserCurrency()
          ),
          breakdownByCurrency: [],
        },
      };
    } catch (error) {
      console.error('사용 금액 계산 실패:', error);
      return {
        totalInUserCurrency: 0,
        localSpending: {
          totalInOriginalCurrency: 0,
          totalInUserCurrency: 0,
          formattedTotalInOriginalCurrency: formatCurrencyWithExchange(
            0,
            budgetCurrency || 'USD'
          ),
          formattedTotalInUserCurrency: formatCurrencyWithExchange(
            0,
            getUserCurrency()
          ),
          breakdownByCurrency: [],
        },
      };
    }
  }, [planId, budgetCurrency, getUserCurrency, getDestinationCurrency]);

  // 예산 정보 계산 및 변환
  const calculateBudgetInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userCurrency = getUserCurrency();
      const effectiveBudgetCurrency =
        budgetCurrency || getDestinationCurrency();
      const spentData = await calculateSpentAmount();
      // 예산 통화 기준 지출 합계를 사용해 변환 (이중 변환 방지)
      const spentInOriginalCurrency =
        spentData.localSpending.totalInOriginalCurrency;

      // 환율 적용하여 예산 정보 계산 (원화→사용자 통화 단일 변환)
      const exchangeResult = await calculateBudgetWithExchange(
        targetBudget,
        effectiveBudgetCurrency,
        userCurrency,
        spentInOriginalCurrency
      );

      const spentPercentage =
        exchangeResult.targetBudgetInUserCurrency > 0
          ? (exchangeResult.spentAmountInUserCurrency /
              exchangeResult.targetBudgetInUserCurrency) *
            100
          : 0;

      // 원래 통화로 사용 금액 계산 (예: 1000달러 중 100달러 사용 = 900달러 남음)
      const remainingInOriginalCurrency =
        targetBudget - spentInOriginalCurrency;

      const newBudgetInfo: BudgetInfo = {
        targetBudget: exchangeResult.targetBudgetInUserCurrency,
        spentAmount: exchangeResult.spentAmountInUserCurrency,
        remainingBudget: exchangeResult.remainingBudgetInUserCurrency,
        currency: userCurrency,
        originalCurrency: effectiveBudgetCurrency,
        exchangeRate: exchangeResult.exchangeRate,
        spentPercentage: Math.min(100, spentPercentage),
        formattedTargetBudget: formatCurrencyWithExchange(
          exchangeResult.targetBudgetInUserCurrency,
          userCurrency
        ),
        formattedSpentAmount: formatCurrencyWithExchange(
          exchangeResult.spentAmountInUserCurrency,
          userCurrency
        ),
        formattedRemainingBudget: formatCurrencyWithExchange(
          exchangeResult.remainingBudgetInUserCurrency,
          userCurrency
        ),
        originalBudgetInfo: {
          targetBudget: targetBudget,
          spentAmount: spentInOriginalCurrency,
          remainingBudget: remainingInOriginalCurrency,
          formattedTargetBudget: formatCurrencyWithExchange(
            targetBudget,
            effectiveBudgetCurrency
          ),
          formattedSpentAmount: formatCurrencyWithExchange(
            spentInOriginalCurrency,
            effectiveBudgetCurrency
          ),
          formattedRemainingBudget: formatCurrencyWithExchange(
            remainingInOriginalCurrency,
            effectiveBudgetCurrency
          ),
        },
        localSpending: spentData.localSpending,
      };

      setBudgetInfo(newBudgetInfo);
    } catch (err) {
      console.error('예산 정보 계산 실패:', err);
      setError('예산 정보를 불러오는데 실패했습니다.');

      // 에러 시 기본 정보 설정
      const userCurrency = getUserCurrency();
      const origCur = budgetCurrency || userCurrency;
      setBudgetInfo({
        targetBudget,
        spentAmount: 0,
        remainingBudget: targetBudget,
        currency: userCurrency,
        originalCurrency: origCur,
        exchangeRate: 1,
        spentPercentage: 0,
        formattedTargetBudget: formatCurrencyWithExchange(
          targetBudget,
          userCurrency
        ),
        formattedSpentAmount: formatCurrencyWithExchange(0, userCurrency),
        formattedRemainingBudget: formatCurrencyWithExchange(
          targetBudget,
          userCurrency
        ),
        originalBudgetInfo: {
          targetBudget,
          spentAmount: 0,
          remainingBudget: targetBudget,
          formattedTargetBudget: formatCurrencyWithExchange(
            targetBudget,
            origCur
          ),
          formattedSpentAmount: formatCurrencyWithExchange(0, origCur),
          formattedRemainingBudget: formatCurrencyWithExchange(
            targetBudget,
            origCur
          ),
        },
        localSpending: {
          totalInOriginalCurrency: 0,
          totalInUserCurrency: 0,
          formattedTotalInOriginalCurrency: formatCurrencyWithExchange(
            0,
            origCur
          ),
          formattedTotalInUserCurrency: formatCurrencyWithExchange(
            0,
            userCurrency
          ),
          breakdownByCurrency: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    targetBudget,
    budgetCurrency,
    getUserCurrency,
    getDestinationCurrency,
    calculateSpentAmount,
  ]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    calculateBudgetInfo();
  }, [calculateBudgetInfo]);

  // 초기 로드 및 의존성 변경 시 재계산
  useEffect(() => {
    if (targetBudget > 0) {
      calculateBudgetInfo();
    } else {
      setIsLoading(false);
    }
  }, [calculateBudgetInfo, targetBudget]);

  return {
    budgetInfo,
    isLoading,
    error,
    refresh,
  };
};
