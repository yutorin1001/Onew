// app/api/quote/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jupiterUrl = `https://quote-api.jup.ag/v6/quote?${searchParams.toString()}`;
  
  try {
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://jup.ag',
        'Referer': 'https://jup.ag/',
      },
      // サーバーサイドでのキャッシュを無効化
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Jupiter API Reject', detail: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // ログに出力して詳細を確認（VercelのLogsで見れます）
    console.error("Vercel Fetch Error:", error.message);
    return NextResponse.json({ error: 'fetch failed', message: error.message }, { status: 500 });
  }
}