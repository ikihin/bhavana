import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { getProgram } from "../lib/program";
import { getPropertyPDA, getMintPDA, getVaultPDA } from "../lib/constants";

export type TxStatus = "idle" | "pending" | "confirmed" | "error";

interface UseBuySharesReturn {
  buyShares: (propertyName: string, numShares: number) => Promise<string | null>;
  status: TxStatus;
  error: string | null;
  txSignature: string | null;
  reset: () => void;
}

export function useBuyShares(): UseBuySharesReturn {
  const wallet = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxSignature(null);
  }, []);

  const buyShares = useCallback(
    async (propertyName: string, numShares: number): Promise<string | null> => {
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
        const buyerATA = await getAssociatedTokenAddress(
          mintPDA,
          wallet.publicKey
        );

        const sig = await program.methods
          .buyShares(new anchor.BN(numShares))
          .accounts({
            property: propertyPDA,
            mint: mintPDA,
            vault: vaultPDA,
            buyerTokenAccount: buyerATA,
            buyer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .rpc();

        setTxSignature(sig);
        setStatus("confirmed");
        return sig;
      } catch (err: any) {
        const message = parseAnchorError(err);
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [wallet]
  );

  return { buyShares, status, error, txSignature, reset };
}

function parseAnchorError(err: any): string {
  const msg = err?.message || err?.toString() || "Transaction failed";

  if (msg.includes("InsufficientFunds")) {
    return "Saldo SOL tidak cukup untuk membeli shares ini";
  }
  if (msg.includes("SoldOut")) {
    return "Semua shares untuk properti ini sudah terjual";
  }
  if (msg.includes("PropertyNotActive")) {
    return "Properti ini sedang tidak aktif";
  }
  if (msg.includes("User rejected")) {
    return "Transaksi dibatalkan";
  }

  return msg;
}
