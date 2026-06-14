import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import WalletConnect from './components/WalletConnect'
import BalanceDisplay from './components/BalanceDisplay'
import SendPayment from './components/SendPayment'

function App() {
  const [address, setAddress] = useState(null)
  const [balanceKey, setBalanceKey] = useState(0)

  const refreshBalance = useCallback(() => {
    setBalanceKey((k) => k + 1)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />

      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Bhavana</h1>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
            Testnet
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Real World Asset Tokenization
          </h2>
          <p className="text-gray-600">
            Democratizing property investment on Stellar blockchain
          </p>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          <WalletConnect
            address={address}
            setAddress={setAddress}
            onConnected={refreshBalance}
          />

          <BalanceDisplay key={balanceKey} address={address} />

          <SendPayment address={address} onSuccess={refreshBalance} />
        </div>

        {!address && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-md">
              <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
              <ol className="text-sm text-gray-600 text-left space-y-2">
                <li>1. Install the Freighter wallet extension</li>
                <li>2. Create an account and switch to Testnet</li>
                <li>3. Connect your wallet above</li>
                <li>4. Fund your account with Friendbot</li>
                <li>5. Send XLM to any testnet address</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-auto py-4">
        <p className="text-center text-sm text-gray-500">
          Bhavana &mdash; Built on Stellar Testnet
        </p>
      </footer>
    </div>
  )
}

export default App
