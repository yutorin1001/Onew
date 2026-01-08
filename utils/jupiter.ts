// utils/jupiter.ts

// 自分のサーバーのAPIを指すようにする
// 自分のNext.jsサーバーのAPIルートを指します
const INTERNAL_API = '/api/quote';

// 型定義をエクスポート（page.tsxで読み込めるようにします）
export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot?: number;
  timeTaken?: number;
  error?: any;
}

/**
 * Next.jsのAPI Route経由でJupiterのQuoteを取得する関数
 */
export async function getQuote(
  inputMint: string, 
  outputMint: string, 
  amount: number
): Promise<QuoteResponse> {
  // SOLのDecimals(9)に基づいてLamportsに変換
  const amountInLamports = Math.floor(amount * 1000000000); 

  // クエリパラメータを組み立て
  const params = new URLSearchParams({
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amountInLamports.toString(),
    slippageBps: '50', // 0.5%
  });

  const url = `${INTERNAL_API}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}