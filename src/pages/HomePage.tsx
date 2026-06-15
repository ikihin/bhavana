import { FC } from "react";
import { Logo } from "../components/Logo";
import { PropertyCard } from "../components/PropertyCard";
import { useProperties, type PropertyOnChain } from "../hooks/useProperties";
import { formatIDR } from "../lib/constants";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onInvest: (property: PropertyOnChain) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate, onInvest }) => {
  const { properties, loading } = useProperties();

  return (
    <div className="pt-16">
      {/* Devnet disclaimer */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2">
          <span className="text-yellow-500">⚠️</span>
          <p className="text-yellow-400/90 text-xs sm:text-sm text-center">
            Ini adalah proof of concept di Solana devnet. Bukan produk investasi nyata.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D9E75]/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Logo size="lg" className="mx-auto mb-8" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E1F5EE] leading-tight mb-6">
            Miliki Properti Indonesia.
            <br />
            <span className="text-[#5DCAA5]">Mulai {formatIDR(150000)}.</span>
          </h1>
          <p className="text-[#9FE1CB] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Investasi properti kos-kosan dan apartemen di kota besar Indonesia.
            Terima yield bulanan langsung ke wallet Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("properties")}
              className="px-8 py-4 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-bold rounded-lg transition-colors cursor-pointer text-lg"
            >
              Lihat Properti
            </button>
            <button
              onClick={() => onNavigate("portfolio")}
              className="px-8 py-4 bg-transparent border border-[#1D3A2F] hover:border-[#5DCAA5] text-[#9FE1CB] font-medium rounded-lg transition-colors cursor-pointer"
            >
              Portofolio Saya
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-[#1D3A2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[#E1F5EE]">3</p>
              <p className="text-sm text-[#9FE1CB] mt-1">Properti</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[#E1F5EE]">Rp 5.1M</p>
              <p className="text-sm text-[#9FE1CB] mt-1">Total Nilai</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[#5DCAA5]">8.5%</p>
              <p className="text-sm text-[#9FE1CB] mt-1">Avg Yield/Thn</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[#E1F5EE]">Solana</p>
              <p className="text-sm text-[#9FE1CB] mt-1">Blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-[#1D3A2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E1F5EE] text-center mb-12">
            Cara Kerja
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Hubungkan Wallet",
                desc: "Gunakan Phantom wallet. Semua transaksi di Solana devnet.",
              },
              {
                step: "02",
                title: "Pilih Properti",
                desc: "Pilih kos atau apartemen. Lihat yield, lokasi, dan harga per share.",
              },
              {
                step: "03",
                title: "Terima Yield",
                desc: "Dapatkan distribusi rental income bulanan langsung ke wallet.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#162230] border border-[#1D3A2F] rounded-xl p-6 hover:border-[#1D9E75]/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center mb-4">
                  <span className="text-[#5DCAA5] font-bold text-sm">{item.step}</span>
                </div>
                <h3 className="text-[#E1F5EE] font-semibold mb-2">{item.title}</h3>
                <p className="text-[#9FE1CB] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property preview */}
      <section className="py-16 border-t border-[#1D3A2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#E1F5EE]">
              Properti Tersedia
            </h2>
            <button
              onClick={() => onNavigate("properties")}
              className="text-[#5DCAA5] text-sm font-medium hover:text-[#E1F5EE] transition-colors cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#162230] border border-[#1D3A2F] rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.seed.name} property={prop} onInvest={onInvest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1D3A2F] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" className="opacity-50" />
          <p className="text-sm text-[#9FE1CB]/60">
            Bhavana — Demokratisasi Investasi Properti di Solana
          </p>
        </div>
      </footer>
    </div>
  );
};
