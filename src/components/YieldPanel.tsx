import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDistributeYield } from "../hooks/useDistributeYield";
import { PROPERTIES, formatIDR } from "../lib/constants";

// Replace with your admin pubkey after deployment
const ADMIN_PUBKEY = "YOUR_ADMIN_PUBKEY_HERE";

export const YieldPanel: FC = () => {
  const wallet = useWallet();
  const { distributeYield, status, error, txSignature, reset } = useDistributeYield();
  const [selectedProperty, setSelectedProperty] = useState(0);
  const [holderAddress, setHolderAddress] = useState("");
  const [yieldAmount, setYieldAmount] = useState("0.1");

  // Only show if connected wallet is admin (for demo, always show with banner)
  const isAdmin = wallet.publicKey?.toString() === ADMIN_PUBKEY;

  const handleDistribute = async () => {
    if (!holderAddress) return;

    try {
      const holderPubkey = new PublicKey(holderAddress);
      const yieldLamports = Math.floor(parseFloat(yieldAmount) * LAMPORTS_PER_SOL);

      await distributeYield(
        PROPERTIES[selectedProperty].name,
        holderPubkey,
        yieldLamports
      );
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-6">
      {/* Demo banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 flex items-center gap-2">
        <span className="text-yellow-500 text-lg">⚠️</span>
        <p className="text-yellow-400/90 text-sm font-medium">
          Demo Mode — Solana Devnet Only
        </p>
      </div>

      <h3 className="text-[#E1F5EE] font-bold text-lg mb-1">Distribusi Yield</h3>
      <p className="text-[#9FE1CB] text-sm mb-6">
        Simulasi distribusi rental income ke pemegang token
      </p>

      {/* Property selector */}
      <div className="mb-4">
        <label className="block text-[#9FE1CB] text-sm mb-2">Properti</label>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(Number(e.target.value))}
          className="w-full h-10 bg-[#0F1923] border border-[#1D3A2F] rounded-lg px-3 text-[#E1F5EE] text-sm focus:border-[#1D9E75] outline-none"
        >
          {PROPERTIES.map((p, i) => (
            <option key={i} value={i}>
              {p.name} — Yield {p.annualYieldBps / 100}%/thn
            </option>
          ))}
        </select>
      </div>

      {/* Holder address */}
      <div className="mb-4">
        <label className="block text-[#9FE1CB] text-sm mb-2">Alamat Holder</label>
        <input
          type="text"
          placeholder="Pubkey pemegang token..."
          value={holderAddress}
          onChange={(e) => setHolderAddress(e.target.value)}
          className="w-full h-10 bg-[#0F1923] border border-[#1D3A2F] rounded-lg px-3 text-[#E1F5EE] text-sm placeholder-[#9FE1CB]/30 focus:border-[#1D9E75] outline-none"
        />
      </div>

      {/* Yield amount */}
      <div className="mb-6">
        <label className="block text-[#9FE1CB] text-sm mb-2">Total Yield (SOL)</label>
        <input
          type="number"
          step="0.01"
          min="0.001"
          value={yieldAmount}
          onChange={(e) => setYieldAmount(e.target.value)}
          className="w-full h-10 bg-[#0F1923] border border-[#1D3A2F] rounded-lg px-3 text-[#E1F5EE] text-sm focus:border-[#1D9E75] outline-none"
        />
        <p className="text-[#9FE1CB]/60 text-xs mt-1">
          ≈ {formatIDR(Math.round(parseFloat(yieldAmount || "0") * 250_000_000))} total untuk didistribusikan
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success */}
      {status === "confirmed" && txSignature && (
        <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-lg p-3 mb-4">
          <p className="text-[#5DCAA5] text-sm font-medium mb-1">Yield berhasil didistribusikan!</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5DCAA5] text-xs hover:text-[#E1F5EE] transition-colors"
          >
            Lihat di Explorer →
          </a>
        </div>
      )}

      {/* Distribute button */}
      <button
        onClick={handleDistribute}
        disabled={status === "pending" || !wallet.connected || !holderAddress}
        className="w-full py-3 bg-[#1D9E75] hover:bg-[#5DCAA5] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        {status === "pending" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memproses...
          </>
        ) : (
          "Simulasi Distribusi Yield"
        )}
      </button>

      {/* History mock */}
      <div className="mt-6 pt-5 border-t border-[#1D3A2F]">
        <h4 className="text-[#9FE1CB] text-sm font-medium mb-3">Riwayat Distribusi</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#9FE1CB]/60">Juni 2026 — Kos Putri Malioboro</span>
            <span className="text-[#5DCAA5] font-medium">{formatIDR(45000)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#9FE1CB]/60">Mei 2026 — Apartemen Sudirman</span>
            <span className="text-[#5DCAA5] font-medium">{formatIDR(38000)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
