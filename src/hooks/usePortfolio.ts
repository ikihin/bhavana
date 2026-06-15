import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getConnection } from "../lib/program";
import {
  PROPERTIES,
  getMintPDA,
  formatIDR,
  lamportsToSol,
  type PropertySeed,
} from "../lib/constants";

export interface PortfolioHolding {
  property: PropertySeed;
  mint: PublicKey;
  shares: number;
  valueIDR: number;
  valueSOL: number;
  estimatedMonthlyYieldIDR: number;
  ataAddress: PublicKey;
}

interface UsePortfolioReturn {
  holdings: PortfolioHolding[];
  totalValueIDR: number;
  totalMonthlyYieldIDR: number;
  totalShares: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const wallet = useWallet();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!wallet.publicKey) {
      setHoldings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connection = getConnection();
      const results: PortfolioHolding[] = [];

      for (const property of PROPERTIES) {
        const [mint] = getMintPDA(property.name);

        try {
          const ata = await getAssociatedTokenAddress(mint, wallet.publicKey);
          const tokenAccount = await getAccount(connection, ata);
          const shares = Number(tokenAccount.amount);

          if (shares > 0) {
            const valueIDR = shares * property.pricePerShareIDR;
            const valueSOL = lamportsToSol(
              shares * property.pricePerShareLamports
            );
            // Monthly yield = (annual yield / 12) * value
            const estimatedMonthlyYieldIDR =
              (property.annualYieldBps / 10000 / 12) * valueIDR;

            results.push({
              property,
              mint,
              shares,
              valueIDR,
              valueSOL,
              estimatedMonthlyYieldIDR,
              ataAddress: ata,
            });
          }
        } catch {
          // ATA doesn't exist = user holds 0 shares of this property
          continue;
        }
      }

      setHoldings(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const totalValueIDR = holdings.reduce((sum, h) => sum + h.valueIDR, 0);
  const totalMonthlyYieldIDR = holdings.reduce(
    (sum, h) => sum + h.estimatedMonthlyYieldIDR,
    0
  );
  const totalShares = holdings.reduce((sum, h) => sum + h.shares, 0);

  return {
    holdings,
    totalValueIDR,
    totalMonthlyYieldIDR,
    totalShares,
    loading,
    error,
    refetch: fetchPortfolio,
  };
}
