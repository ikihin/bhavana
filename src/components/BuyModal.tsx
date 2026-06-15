import { FC, useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBuyShares } from "../hooks/useBuyShares";
import { formatIDR, lamportsToSol } from "../lib/constants";
import type { PropertyOnChain } from "../hooks/useProperties";

interface BuyModalProps {
  property: PropertyOnChain;
  onClose: () => void;
  onSuccess: () => void;
}

export const BuyModal: FC<BuyModalProps> = ({ property, onClose, onSuccess }) => {
  const wallet = useWallet();
  const { buyShares, status, error, txSignature, reset } = useBuyShares();
  const [numShares, setNumShares] = useState(1);

  const totalCostIDR = useMemo(
    () => numShares * property.seed.pricePerShareIDR,
    [numShares, property.seed.pricePerShareIDR]
  );

  const totalCostSOL = useMemo(
    () => lamportsToSol(numShares * property.pricePerShareLamports),
    [numShares, property.pricePerShareLamports]
  );

  const monthlyYieldIDR = useMemo(
    () => (property.annualYieldBps / 10000 / 12) * totalCostIDR,
    [property.annualYieldBps, totalCostIDR]
  );

  const maxShares = property.sharesRemaining;

  const handleBuy = async () => {
    if (!wallet.connected) return;
    const sig = await buyShares(property.seed.name, numShares);
    if (sig) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-[#162230] border border-[#1D3A2F] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#E1F5EE] font-bold text-lg">Beli Shares</h3>
          <button
            onClick={handleClose}
            className="text-[#9FE1CB] hover:text-[#E1F5EE] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Property info */}
        <div className="bg-[#0F1923] rounded-lg p-3 mb-5">
          <p className="text-[#E1F5EE] font-medium text-sm">{property.seed.name}</p>
          <p className="text-[#9FE1CB] text-xs">{property.seed.location.split(",")[0]}</p>
        </div>

        {status === "confirmed" ? (
          /* Success state */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#5DCAA5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-[#E1F5EE] font-bold text-lg mb-2">Investasi Berhasil!</h4>
            <p className="text-[#9FE1CB] text-sm mb-4">
              Anda telah membeli {numShares} shares {property.seed.name}
            </p>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#5DCAA5] hover:text-[#E1F5EE] transition-colors"
              >
                Lihat transaksi di Explorer
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          /* Buy form */
          <>
            {/* Shares input */}
            <div className="mb-5">
              <label className="block text-[#9FE1CB] text-sm mb-2">Jumlah Shares</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNumShares(Math.max(1, numShares - 1))}
                  disabled={status === "pending"}
                  className="w-10 h-10 rounded-lg bg-[#0F1923] border border-[#1D3A2F] text-[#E1F5EE] font-bold hover:border-[#1D9E75] cursor-pointer disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxShares}
                  value={numShares}
                  onChange={(e) =>
                    setNumShares(Math.min(maxShares, Math.max(1, Number(e.target.value) || 1)))
                  }
                  disabled={status === "pending"}
                  className="flex-1 h-10 bg-[#0F1923] border border-[#1D3A2F] rounded-lg text-center text-[#E1F5EE] font-bold text-lg focus:border-[#1D9E75] outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => setNumShares(Math.min(maxShares, numShares + 1))}
                  disabled={status === "pending"}
                  className="w-10 h-10 rounded-lg bg-[#0F1923] border border-[#1D3A2F] text-[#E1F5EE] font-bold hover:border-[#1D9E75] cursor-pointer disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="text-[#9FE1CB]/60 text-xs mt-1.5 text-right">
                Maks: {maxShares} shares tersedia
              </p>
            </div>

            {/* Cost breakdown */}
            <div className="bg-[#0F1923] rounded-lg p-4 mb-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-[#9FE1CB] text-sm">Total Biaya</span>
                <div className="text-right">
                  <p className="text-[#E1F5EE] font-bold">{formatIDR(totalCostIDR)}</p>
                  <p className="text-[#9FE1CB] text-xs">{totalCostSOL.toFixed(4)} SOL</p>
                </div>
              </div>
              <div className="border-t border-[#1D3A2F] pt-3 flex justify-between">
                <span className="text-[#9FE1CB] text-sm">Est. Return/Bulan</span>
                <span className="text-[#5DCAA5] font-semibold">
                  {formatIDR(Math.round(monthlyYieldIDR))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9FE1CB] text-sm">Yield Tahunan</span>
                <span className="text-[#5DCAA5] font-semibold">
                  {property.annualYieldBps / 100}%
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Buy button */}
            {!wallet.connected ? (
              <p className="text-center text-[#9FE1CB] text-sm py-3">
                Hubungkan wallet untuk membeli
              </p>
            ) : (
              <button
                onClick={handleBuy}
                disabled={status === "pending" || numShares === 0}
                className="w-full py-3.5 bg-[#1D9E75] hover:bg-[#5DCAA5] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
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
                  `Beli ${numShares} Share — ${formatIDR(totalCostIDR)}`
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
