import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getReadOnlyProgram, getConnection } from "../lib/program";
import {
  PROPERTIES,
  getPropertyPDA,
  getMintPDA,
  getVaultPDA,
  lamportsToSol,
  formatIDR,
  IDR_PER_SOL,
  type PropertySeed,
} from "../lib/constants";

export interface PropertyOnChain {
  // Seed data (always available)
  seed: PropertySeed;
  // On-chain data (null if not yet initialized)
  pda: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  admin: PublicKey | null;
  totalShares: number;
  sharesSold: number;
  sharesRemaining: number;
  pricePerShareLamports: number;
  annualYieldBps: number;
  isActive: boolean;
  // Derived display values
  vaultBalanceLamports: number;
  vaultBalanceSOL: number;
  percentSold: number;
  priceDisplayIDR: string;
  yieldDisplay: string;
  // Loading state per property
  loaded: boolean;
}

interface UsePropertiesReturn {
  properties: PropertyOnChain[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProperties(): UsePropertiesReturn {
  const [properties, setProperties] = useState<PropertyOnChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = getReadOnlyProgram();
      const connection = getConnection();

      const results: PropertyOnChain[] = await Promise.all(
        PROPERTIES.map(async (seed) => {
          const [pda] = getPropertyPDA(seed.name);
          const [mint] = getMintPDA(seed.name);
          const [vault] = getVaultPDA(seed.name);

          try {
            // Fetch on-chain account data
            const account = await (program.account as any).propertyAccount.fetch(pda);
            const vaultBalance = await connection.getBalance(vault);

            return {
              seed,
              pda,
              mint,
              vault,
              admin: account.admin,
              totalShares: account.totalShares.toNumber(),
              sharesSold: account.sharesSold.toNumber(),
              sharesRemaining:
                account.totalShares.toNumber() - account.sharesSold.toNumber(),
              pricePerShareLamports: account.pricePerShareLamports.toNumber(),
              annualYieldBps: account.annualYieldBps,
              isActive: account.isActive,
              vaultBalanceLamports: vaultBalance,
              vaultBalanceSOL: lamportsToSol(vaultBalance),
              percentSold:
                (account.sharesSold.toNumber() / account.totalShares.toNumber()) *
                100,
              priceDisplayIDR: formatIDR(seed.pricePerShareIDR),
              yieldDisplay: `${account.annualYieldBps / 100}%`,
              loaded: true,
            };
          } catch {
            // Property not initialized on-chain yet — return seed data with defaults
            return {
              seed,
              pda,
              mint,
              vault,
              admin: null,
              totalShares: seed.totalShares,
              sharesSold: 0,
              sharesRemaining: seed.totalShares,
              pricePerShareLamports: seed.pricePerShareLamports,
              annualYieldBps: seed.annualYieldBps,
              isActive: false,
              vaultBalanceLamports: 0,
              vaultBalanceSOL: 0,
              percentSold: 0,
              priceDisplayIDR: formatIDR(seed.pricePerShareIDR),
              yieldDisplay: `${seed.annualYieldBps / 100}%`,
              loaded: false,
            };
          }
        })
      );

      setProperties(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}
