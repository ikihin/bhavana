import { FC } from "react";
import { formatIDR, lamportsToSol } from "../lib/constants";
import type { PropertyOnChain } from "../hooks/useProperties";

interface PropertyCardProps {
  property: PropertyOnChain;
  onInvest: (property: PropertyOnChain) => void;
}

const PROPERTY_IMAGES: Record<string, string> = {
  "Kos Putri Malioboro":
    "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=600&h=400&fit=crop",
  "Apartemen Sudirman Park":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
  "Kos Premium Dago":
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
};

export const PropertyCard: FC<PropertyCardProps> = ({ property, onInvest }) => {
  const percentSold = property.totalShares > 0
    ? (property.sharesSold / property.totalShares) * 100
    : 0;

  const image = PROPERTY_IMAGES[property.seed.name] || PROPERTY_IMAGES["Kos Putri Malioboro"];

  return (
    <div className="bg-[#162230] border border-[#1D3A2F] rounded-xl overflow-hidden hover:border-[#1D9E75]/50 transition-all group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={property.seed.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            property.isActive
              ? "bg-[#1D9E75]/90 text-white"
              : "bg-gray-600/90 text-gray-300"
          }`}>
            {property.isActive ? "Aktif" : "Segera"}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded text-xs font-medium bg-[#0F1923]/80 text-[#5DCAA5]">
            Yield {property.yieldDisplay}/thn
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[#E1F5EE] font-semibold text-lg mb-1">
          {property.seed.name}
        </h3>
        <p className="text-[#9FE1CB] text-sm mb-4 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.seed.location.split(",")[0]}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[#E1F5EE] font-bold text-xl">
            {formatIDR(property.seed.pricePerShareIDR)}
          </span>
          <span className="text-[#9FE1CB] text-xs">
            ({lamportsToSol(property.pricePerShareLamports).toFixed(4)} SOL) /share
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#9FE1CB] mb-1.5">
            <span>{property.sharesSold} terjual</span>
            <span>{property.sharesRemaining} tersisa</span>
          </div>
          <div className="h-2 bg-[#0F1923] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1D9E75] to-[#5DCAA5] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentSold, 100)}%` }}
            />
          </div>
          <p className="text-right text-xs text-[#9FE1CB]/60 mt-1">
            {percentSold.toFixed(1)}% terjual
          </p>
        </div>

        {/* Invest button */}
        <button
          onClick={() => onInvest(property)}
          disabled={!property.isActive || property.sharesRemaining === 0}
          className="w-full py-3 bg-[#1D9E75] hover:bg-[#5DCAA5] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
        >
          {property.sharesRemaining === 0
            ? "Terjual Habis"
            : "Investasi Sekarang"}
        </button>
      </div>
    </div>
  );
};
