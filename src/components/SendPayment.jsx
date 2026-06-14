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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Send XLM</h2>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
            Destination Address
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G..."
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
            Amount (XLM)
          </label>
          <input
            type="number"
            step="0.0000001"
            min="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !destination || !amount}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {loading ? 'Sending...' : 'Send Payment'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
          <p className="text-green-800 font-semibold">Transaction Successful!</p>
          <p className="text-sm text-gray-600 mt-1 break-all">
            Hash: <span className="font-mono text-xs">{result.hash}</span>
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
          >
            View on Explorer &rarr;
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
          <p className="text-red-800 font-semibold">Transaction Failed</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}
