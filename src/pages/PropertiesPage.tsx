import { FC } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { useProperties, type PropertyOnChain } from "../hooks/useProperties";

interface PropertiesPageProps {
  onInvest: (property: PropertyOnChain) => void;
}

export const PropertiesPage: FC<PropertiesPageProps> = ({ onInvest }) => {
  const { properties, loading, error, refetch } = useProperties();

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E1F5EE] mb-2">Properti Tersedia</h1>
          <p className="text-[#9FE1CB]">
            Pilih properti untuk investasi. Semua data real dari pasar kos-kosan Indonesia.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={refetch}
              className="text-red-400 text-sm underline cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#162230] border border-[#1D3A2F] rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-[#1D3A2F]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[#1D3A2F] rounded w-3/4" />
                  <div className="h-4 bg-[#1D3A2F] rounded w-1/2" />
                  <div className="h-8 bg-[#1D3A2F] rounded w-2/3 mt-4" />
                  <div className="h-2 bg-[#1D3A2F] rounded w-full mt-4" />
                  <div className="h-10 bg-[#1D3A2F] rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.seed.name} property={prop} onInvest={onInvest} />
            ))}
          </div>
        )}

        {/* Info banner */}
        <div className="mt-10 bg-[#162230] border border-[#1D3A2F] rounded-xl p-6">
          <h3 className="text-[#E1F5EE] font-semibold mb-2">Tentang Data Properti</h3>
          <p className="text-[#9FE1CB] text-sm leading-relaxed">
            Harga share dikonversi dari Rupiah ke SOL berdasarkan kurs ilustrasi.
            Yield tahunan dihitung dari rata-rata occupancy rate kos-kosan di lokasi tersebut.
            Ini adalah demo di Solana devnet — bukan penawaran investasi nyata.
          </p>
        </div>
      </div>
    </div>
  );
};
