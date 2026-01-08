'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getQuote, QuoteResponse } from '../utils/jupiter';

// 定数: SOLのMintアドレス
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function TokenPriceChecker() {
  const { publicKey } = useWallet();

  // 入力状態
  const [outputMint, setOutputMint] = useState(''); // 調べたいトークンのアドレス
  const [amount, setAmount] = useState(0.1); // 基準となるSOLの量
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // レートを取得する関数
const handleCheckRate = async () => {
    if (!outputMint) {
      setStatus('❌ エラー: ミントアドレスを入力してください');
      return;
    }
    
    setLoading(true);
    setStatus('🔍 診断中...');
    setQuote(null);

    try {
      // 1. アドレス形式の簡易チェック
      if (outputMint.length < 32) {
        throw new Error('アドレスの長さが足りません（通常は32〜44文字です）');
      }

      // 2. Jupiter API へのリクエスト
      const data = await getQuote(SOL_MINT, outputMint.trim(), amount);
      console.log("Jupiter API Response:", data); // コンソールで詳細を確認可能

      // 3. レスポンス内容の判定
// page.tsx の handleCheckRate 内
if (data && 'error' in data) {
  // 修正：オブジェクトの中身を文字列にして表示する
  setStatus(`⚠️ Jupiter制限`);
} else if (data && data.outAmount) {
        setQuote(data);
        setStatus('✅ 取得成功');
      } else {
        setStatus('❓ 応答がありましたが、レート情報が含まれていません。');
      }

    } catch (e: any) {
      console.error("Diagnostic Error:", e);
      
      // 原因の切り分け
      if (e.message.includes('Failed to fetch')) {
        setStatus('🌐 通信エラー: price.jup.ag にアクセスできません。ネット環境やDNSを確認してください。');
      } else if (e.message.includes('401') || e.message.includes('Unauthorized')) {
        setStatus('🔑 認証エラー: HeliusのAPIキーが無効、または期限切れです。');
      } else {
        setStatus(`❌ 原因: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
      <nav className="w-full flex justify-between items-center mb-12 max-w-4xl">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
          Mainnet Token Price Checker
        </h1>
        <WalletMultiButton style={{ backgroundColor: '#334155' }} />
      </nav>

      <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2 font-medium">調べたいトークンのMint Address</label>
          <input
            type="text"
            placeholder="例: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-sm focus:border-orange-500 outline-none transition-all"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2 font-medium">比較対象のSOL量</label>
          <div className="relative">
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-sm focus:border-orange-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <span className="absolute right-4 top-3 text-slate-500 text-sm font-bold">SOL</span>
          </div>
        </div>

        <button
          onClick={handleCheckRate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
            loading 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {loading ? '読み込み中...' : '最新レートを確認'}
        </button>

        {/* 結果表示エリア */}
        {quote && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 text-sm">推定受け取り量:</span>
                <span className="font-mono text-xl text-orange-400 font-bold">
                  {/* 小数点以下はトークンのDecimalsに依存しますが、簡易的に表示 */}
                  {(Number(quote.outAmount) / 1_000_000).toLocaleString()} 
                </span>
              </div>
              
              <div className="flex justify-between text-xs border-t border-slate-800 pt-3">
                <span className="text-slate-500">Price Impact:</span>
                <span className={`font-mono ${Number(quote.priceImpactPct) > 1 ? 'text-red-400' : 'text-green-400'}`}>
                  {quote.priceImpactPct}%
                </span>
              </div>
              
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-500">最小受け取り保証:</span>
                <span className="text-slate-400 font-mono">
                  {(Number(quote.otherAmountThreshold) / 1_000_000).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              ※この数値はJupiter API v6から取得したメインネットのリアルタイムデータです。<br/>
              Pumpトークンの場合、Raydium移行済みでないと表示されません。
            </p>
          </div>
        )}

        {status && (
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-center text-xs text-slate-400">
            {status}
          </div>
        )}
      </div>

      <footer className="mt-12 text-slate-600 text-[11px]">
        Network: Mainnet-Beta | Powered by Jupiter API
      </footer>
    </div>
  );
}