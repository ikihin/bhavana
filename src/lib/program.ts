import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, RPC_ENDPOINT } from "./constants";

// IDL will be imported from the build output after `anchor build`
// For now, we inline the type and load from a JSON file
import idl from "../../anchor/target/idl/bhavana.json";

export type BhavanaProgram = Program<Idl>;

/**
 * Get an Anchor Program instance connected to the user's wallet.
 * Use this in hooks that need to send transactions.
 */
export function getProgram(wallet: any): BhavanaProgram {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  return new Program(idl as Idl, provider);
}

/**
 * Get a read-only Program instance (no wallet needed).
 * Use this for fetching account data without connecting a wallet.
 */
export function getReadOnlyProgram(): BhavanaProgram {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  // Read-only provider with a dummy wallet
  const provider = {
    connection,
    publicKey: PublicKey.default,
  } as any;

  return new Program(idl as Idl, provider);
}

/**
 * Get a raw Connection instance for balance queries and account info.
 */
export function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, "confirmed");
}
