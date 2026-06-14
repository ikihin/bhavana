import { useState, useEffect } from 'react'
import { getBalance, fundWithFriendbot } from '../lib/stellar'

export default function BalanceDisplay({ address }) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [funding, setFunding] = useState(false)

  useEffect(() => {
    if (address) fetchBalance()
  }, [address])

  async function fetchBalance() {
    setLoading(true)
    try {
      const bal = await getBalance(address)
      setBalance(bal)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFund() {
    setFunding(true)
    try {
      await fundWithFriendbot(address)
      await fetchBalance()
    } catch (err) {
      console.error('Funding failed:', err)
    } finally {
      setFunding(false)
    }
  }

  if (!address) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Balance</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : balance === null ? (
        <div className="space-y-3">
          <p className="text-gray-500">Account not funded yet</p>
          <button
            onClick={handleFund}
            disabled={funding}
            className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {funding ? 'Funding...' : 'Fund with Friendbot (10,000 XLM)'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-3xl font-bold text-indigo-600">
            {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-gray-500">XLM</span>
          </p>
          <button
            onClick={fetchBalance}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            Refresh Balance
          </button>
        </div>
      )}
    </div>
  )
}
