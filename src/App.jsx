import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import WalletConnect from './components/WalletConnect'
import BalanceDisplay from './components/BalanceDisplay'
import SendPayment from './components/SendPayment'

function App() {
  const [address, setAddress] = useState(null)
  const [balanceKey, setBalanceKey] = useState(0)
  const [activeTab, setActiveTab] = useState('wallet')

  const refreshBalance = useCallback(() => {
    setBalanceKey((k) => k + 1)
  }, [])

  const tabs = [
    { id: 'wallet', label: 'Wallet' },
    { id: 'send', label: 'Send' },
    { id: 'transactions', label: 'Transactions' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Toaster position="top-right" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src="/logo.svg" alt="Bhavana" className="h-8 w-auto" />
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#app" className="hover:text-white transition-colors">App</a>
              <a href="#tokenization" className="hover:text-white transition-colors">How It Works</a>
            </div>
          </div>
          <a
            href="#app"
            className="px-5 py-2 bg-[#c41e2a] hover:bg-[#a01823] text-white text-sm font-semibold rounded transition-colors"
          >
            LAUNCH APP
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
              <span className="text-white">OWN</span>
              <br />
              <span className="text-[#c41e2a]">REAL ESTATE</span>
              <br />
              <span className="text-white">ONCHAIN</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mb-8 leading-relaxed">
              Bhavana is the premier real estate tokenization platform built on Stellar.
              Invest in institutional-grade assets. Liquid. Transparent. Settled on blockchain.
            </p>
            <a
              href="#app"
              className="inline-block px-6 py-3 bg-[#c41e2a] hover:bg-[#a01823] text-white font-semibold rounded transition-colors text-sm tracking-wide"
            >
              LAUNCH APP
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">3-5s</p>
              <p className="text-sm text-gray-500 mt-1">Settlement Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">$0.01</p>
              <p className="text-sm text-gray-500 mt-1">Transaction Fee</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-500 mt-1">Market Access</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">$10</p>
              <p className="text-sm text-gray-500 mt-1">Min. Investment</p>
            </div>
          </div>
        </div>
      </section>

      {/* dApp Section with Tabs */}
      <section id="app" className="py-20 border-t border-white/5">
        <div className="max-w-xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c41e2a] mb-3">Stellar dApp</p>
            <h2 className="text-3xl font-bold text-white">Connect & Transact</h2>
          </div>

          {/* Tab Menu */}
          <div className="flex border-b border-white/10 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c41e2a]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            {activeTab === 'wallet' && (
              <div className="space-y-5">
                <WalletConnect
                  address={address}
                  setAddress={setAddress}
                  onConnected={refreshBalance}
                />
                <BalanceDisplay key={balanceKey} address={address} />

                {!address && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Quick Start</p>
                    <div className="grid gap-2">
                      {[
                        'Install Freighter wallet extension',
                        'Switch to Testnet in Settings',
                        'Click Connect Wallet above',
                        'Fund account with Friendbot',
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm">
                          <span className="w-5 h-5 rounded bg-[#c41e2a]/10 flex items-center justify-center text-[10px] text-[#c41e2a] font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-gray-400">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'send' && (
              <div>
                {address ? (
                  <SendPayment address={address} onSuccess={refreshBalance} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Connect your wallet first to send payments</p>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="px-5 py-2 bg-[#c41e2a] hover:bg-[#a01823] text-white text-sm font-semibold rounded transition-colors cursor-pointer"
                    >
                      Go to Wallet
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                {address ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Transaction history</p>
                    <p className="text-gray-600 text-xs">Send a payment to see it here, or view on explorer:</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#c41e2a] hover:text-[#e8323e] mt-3 transition-colors font-medium"
                    >
                      View on Stellar Expert
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Connect your wallet to view transactions</p>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="px-5 py-2 bg-[#c41e2a] hover:bg-[#a01823] text-white text-sm font-semibold rounded transition-colors cursor-pointer"
                    >
                      Go to Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tokenization Section */}
      <section id="tokenization" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c41e2a] mb-3">How it works</p>
            <h2 className="text-4xl font-bold text-white">Asset Tokenization</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-[#c41e2a]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#c41e2a]/10 flex items-center justify-center mb-5">
                <span className="text-[#c41e2a] font-bold">01</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Link your Stellar wallet — Freighter, xBull, Albedo, or any supported wallet.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-[#c41e2a]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#c41e2a]/10 flex items-center justify-center mb-5">
                <span className="text-[#c41e2a] font-bold">02</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Choose Property</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Browse tokenized real estate. Each property is fractionalized into tradeable tokens.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-[#c41e2a]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#c41e2a]/10 flex items-center justify-center mb-5">
                <span className="text-[#c41e2a] font-bold">03</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Invest & Earn</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Purchase fractions with XLM. Receive rental yields and appreciation automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.svg" alt="Bhavana" className="h-6 w-auto opacity-50" />
          <p className="text-sm text-gray-600">
            Democratizing Real Estate Investment on Stellar
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
