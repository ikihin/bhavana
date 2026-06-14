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
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="flex-1 text-left">
          <p className="text-xs text-green-700 font-medium">Connected</p>
          <p className="text-sm text-gray-700 font-mono truncate max-w-[200px] sm:max-w-[300px]">
            {address}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer"
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
      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors cursor-pointer"
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
