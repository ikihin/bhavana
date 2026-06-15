import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { getProgram } from "../lib/program";
import { getPropertyPDA, getMintPDA, getVaultPDA } from "../lib/constants";

export type DistributeStatus = "idle" | "pending" | "confirmed" | "error";

interface UseDistributeYieldReturn {
  distributeYield: (
    propertyName: string,
    holderPubkey: PublicKey,
    totalYieldLamports: number
  ) => Promise<string | null>;
  status: DistributeStatus;
  error: string | null;
  txSignature: string | null;
  reset: () => void;
}

/**
 * Admin-only hook to distribute rental yield to a specific token holder.
 * In production, this would be called by a cranker iterating all holders.
 * For the MVP demo, admin manually triggers per holder.
 */
export function useDistributeYield(): UseDistributeYieldReturn {
  const wallet = useWallet();
  const [status, setStatus] = useState<DistributeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxSignature(null);
  }, []);

  const distributeYield = useCallback(
    async (
      propertyName: string,
      holderPubkey: PublicKey,
      totalYieldLamports: number
    ): Promise<string | null> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        setError("Wallet not connected");
        setStatus("error");
        return null;
      }

      setStatus("pending");
      setError(null);
      setTxSignature(null);

      try {
        const program = getProgram(wallet);

        const [propertyPDA] = getPropertyPDA(propertyName);
        const [mintPDA] = getMintPDA(propertyName);
        const [vaultPDA] = getVaultPDA(propertyName);
        const holderATA = await getAssociatedTokenAddress(
          mintPDA,
          holderPubkey
        );

        const sig = await program.methods
          .distributeYield(new anchor.BN(totalYieldLamports))
          .accounts({
            property: propertyPDA,
            vault: vaultPDA,
            holderTokenAccount: holderATA,
            holder: holderPubkey,
            admin: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        setTxSignature(sig);
        setStatus("confirmed");
        return sig;
      } catch (err: any) {
        const message = parseDistributeError(err);
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [wallet]
  );

  return { distributeYield, status, error, txSignature, reset };
}

function parseDistributeError(err: any): string {
  const msg = err?.message || err?.toString() || "Distribution failed";

  if (msg.includes("Unauthorized")) {
    return "Hanya admin yang dapat mendistribusikan yield";
  }
  if (msg.includes("PropertyNotActive")) {
    return "Properti tidak aktif";
  }
  if (msg.includes("NoShares")) {
    return "Holder tidak memiliki shares di properti ini";
  }
  if (msg.includes("InsufficientVaultFunds")) {
    return "Vault tidak memiliki cukup SOL untuk distribusi";
  }
  if (msg.includes("YieldTooSmall")) {
    return "Yield terlalu kecil untuk didistribusikan";
  }
  if (msg.includes("User rejected")) {
    return "Transaksi dibatalkan";
  }

  return msg;
}
