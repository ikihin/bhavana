import { useState } from 'react'
import { connectWallet, disconnectWallet } from '../lib/stellar'

export default function WalletConnect({ address, setAddress, onConnected }) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      const addr = await connectWallet()
      setAddress(addr)
      if (onConnected) onConnected(addr)
    } catch (err) {
      console.error('Wallet connection failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    await disconnectWallet()
    setAddress(null)
  }

  if (address) {
    return (
      <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Connected</p>
          <p className="text-xs text-gray-300 font-mono truncate mt-0.5">{address}</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer shrink-0 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="w-full py-3.5 bg-[#c41e2a] hover:bg-[#a01823] disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all cursor-pointer text-sm tracking-wide"
    >
      {loading ? 'Connecting...' : 'CONNECT WALLET'}
    </button>
  )
}
