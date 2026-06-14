import { useState } from 'react'
import { sendPayment } from '../lib/stellar'

export default function SendPayment({ address, onSuccess }) {
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSend(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await sendPayment(destination, amount)
      setResult(res)
      setDestination('')
      setAmount('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  if (!address) return null

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
      <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4">Send Payment</h2>

      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-1.5 text-left uppercase tracking-wider">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G..."
            required
            className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-gray-700 focus:ring-1 focus:ring-[#c41e2a]/50 focus:border-[#c41e2a]/50 outline-none transition-all text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-1.5 text-left uppercase tracking-wider">
            Amount (XLM)
          </label>
          <input
            type="number"
            step="0.0000001"
            min="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            required
            className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-gray-700 focus:ring-1 focus:ring-[#c41e2a]/50 focus:border-[#c41e2a]/50 outline-none transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !destination || !amount}
          className="w-full py-3 bg-[#c41e2a] hover:bg-[#a01823] disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-sm tracking-wide"
        >
          {loading ? 'Processing...' : 'SEND PAYMENT'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-semibold text-xs">Transaction Successful</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Hash</p>
          <p className="text-[11px] text-gray-300 font-mono break-all mt-0.5">{result.hash}</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#c41e2a] hover:text-[#e8323e] mt-3 transition-colors font-medium"
          >
            View on Stellar Expert
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-left">
          <p className="text-red-400 font-semibold text-xs">Transaction Failed</p>
          <p className="text-[11px] text-red-300/70 mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}
