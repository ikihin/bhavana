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
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em]">Portfolio Balance</h2>
        <button
          onClick={fetchBalance}
          className="text-[10px] text-[#c41e2a] hover:text-[#e8323e] font-medium cursor-pointer transition-colors uppercase tracking-wider"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-[#c41e2a]/30 border-t-[#c41e2a] rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      ) : balance === null ? (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">Account not funded</p>
          <button
            onClick={handleFund}
            disabled={funding}
            className="py-2 px-4 bg-[#c41e2a]/10 hover:bg-[#c41e2a]/20 border border-[#c41e2a]/20 text-[#c41e2a] font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 text-xs"
          >
            {funding ? 'Funding...' : 'Fund with Friendbot (10,000 XLM)'}
          </button>
        </div>
      ) : (
        <p className="text-3xl font-bold tracking-tight text-white">
          {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          <span className="text-sm text-gray-500 ml-2 font-normal">XLM</span>
        </p>
      )}
    </div>
  )
}
