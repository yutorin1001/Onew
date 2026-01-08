// app/api/quote/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  const slippageBps = searchParams.get('slippageBps') || '50';

  // バックエンド側でURLを組み立てる
  const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

  try {
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store' // キャッシュさせない
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Jupiter API Error', detail: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}