import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Jupiter公式APIのURLを再構築
  const jupiterUrl = `https://quote-api.jup.ag/v6/quote?${searchParams.toString()}`;

  try {
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://jup.ag/',
        'Origin': 'https://jup.ag'
      },
      // 10秒待機（Jupiterが重い場合があるため）
      signal: AbortSignal.timeout(10000), 
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      return NextResponse.json({ 
        error: 'Jupiter_Reject', 
        status: response.status, 
        detail: errorDetail 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ 
      error: 'Final_Fetch_Failed', 
      message: error.message 
    }, { status: 500 });
  }
}