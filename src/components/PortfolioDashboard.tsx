import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePortfolio } from "../hooks/usePortfolio";
import { formatIDR } from "../lib/constants";

interface PortfolioDashboardProps {
  onNavigateToProperties: () => void;
}

export const PortfolioDashboard: FC<PortfolioDashboardProps> = ({ onNavigateToProperties }) => {
  const wallet = useWallet();
  const { holdings, totalValueIDR, totalMonthlyYieldIDR, totalShares, loading } = usePortfolio();

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#5DCAA5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-[#E1F5EE] font-bold text-xl mb-2">Hubungkan Wallet</h3>
        <p className="text-[#9FE1CB] text-sm mb-6 text-center max-w-sm">
          Hubungkan wallet Phantom untuk melihat portofolio investasi properti Anda
        </p>
        <WalletMultiButton className="!bg-[#1D9E75] hover:!bg-[#5DCAA5] !text-white !font-semibold !rounded-lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#1D3A2F] rounded w-24 mb-3" />
              <div className="h-7 bg-[#1D3A2F] rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full bg-[#162230] border border-[#1D3A2F] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#9FE1CB]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-[#E1F5EE] font-bold text-xl mb-2">Belum Ada Investasi</h3>
        <p className="text-[#9FE1CB] text-sm mb-6 text-center">
          Mulai investasi properti pertama Anda dari {formatIDR(150000)}
        </p>
        <button
          onClick={onNavigateToProperties}
          className="px-6 py-3 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Lihat Properti →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-5">
          <p className="text-[#9FE1CB] text-sm mb-1">Total Investasi</p>
          <p className="text-[#E1F5EE] font-bold text-2xl">{formatIDR(totalValueIDR)}</p>
          <p className="text-[#9FE1CB]/60 text-xs mt-1">{totalShares} shares</p>
        </div>
        <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-5">
          <p className="text-[#9FE1CB] text-sm mb-1">Est. Return/Bulan</p>
          <p className="text-[#5DCAA5] font-bold text-2xl">{formatIDR(Math.round(totalMonthlyYieldIDR))}</p>
          <p className="text-[#9FE1CB]/60 text-xs mt-1">Berdasarkan yield tahunan</p>
        </div>
        <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-5">
          <p className="text-[#9FE1CB] text-sm mb-1">Jumlah Properti</p>
          <p className="text-[#E1F5EE] font-bold text-2xl">{holdings.length}</p>
          <p className="text-[#9FE1CB]/60 text-xs mt-1">properti aktif</p>
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1D3A2F]">
          <h4 className="text-[#E1F5EE] font-semibold">Kepemilikan Anda</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#9FE1CB] text-xs uppercase tracking-wider border-b border-[#1D3A2F]">
                <th className="px-5 py-3">Properti</th>
                <th className="px-5 py-3">Shares</th>
                <th className="px-5 py-3">Nilai</th>
                <th className="px-5 py-3">Yield/Thn</th>
                <th className="px-5 py-3">Est. Return/Bln</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr
                  key={holding.property.name}
                  className="border-b border-[#1D3A2F]/50 hover:bg-[#1D3A2F]/20"
                >
                  <td className="px-5 py-4">
                    <p className="text-[#E1F5EE] font-medium text-sm">{holding.property.name}</p>
                    <p className="text-[#9FE1CB]/60 text-xs">
                      {holding.property.location.split(",")[0]}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[#E1F5EE] font-medium">{holding.shares}</td>
                  <td className="px-5 py-4">
                    <p className="text-[#E1F5EE] font-medium">{formatIDR(holding.valueIDR)}</p>
                    <p className="text-[#9FE1CB]/60 text-xs">{holding.valueSOL.toFixed(4)} SOL</p>
                  </td>
                  <td className="px-5 py-4 text-[#5DCAA5] font-medium">
                    {holding.property.annualYieldBps / 100}%
                  </td>
                  <td className="px-5 py-4 text-[#5DCAA5] font-medium">
                    {formatIDR(Math.round(holding.estimatedMonthlyYieldIDR))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
