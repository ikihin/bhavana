import { PublicKey } from "@solana/web3.js";

// Replace with your deployed program ID after `anchor deploy`
export const PROGRAM_ID = new PublicKey(
  "BhvnRWA1111111111111111111111111111111111111"
);

export const RPC_ENDPOINT = "https://api.devnet.solana.com";

export const LAMPORTS_PER_SOL = 1_000_000_000;

// IDR to lamports conversion (approximate, for display)
// At ~Rp 250,000,000 / SOL on devnet (illustrative)
export const IDR_PER_SOL = 250_000_000;

export interface PropertySeed {
  name: string;
  location: string;
  totalShares: number;
  pricePerShareLamports: number;
  pricePerShareIDR: number;
  annualYieldBps: number;
  image: string;
}

export const PROPERTIES: PropertySeed[] = [
  {
    name: "Kos Putri Malioboro",
    location: "Jl. Malioboro No. 47, Yogyakarta 55213",
    totalShares: 1000,
    pricePerShareLamports: 600_000,
    pricePerShareIDR: 150_000,
    annualYieldBps: 920,
    image: "/properties/malioboro.jpg",
  },
  {
    name: "Apartemen Sudirman Park",
    location: "Jl. KH Mas Mansyur, Jakarta Pusat 10220",
    totalShares: 500,
    pricePerShareLamports: 2_000_000,
    pricePerShareIDR: 500_000,
    annualYieldBps: 780,
    image: "/properties/sudirman.jpg",
  },
  {
    name: "Kos Premium Dago",
    location: "Jl. Ir. H. Juanda No. 112, Bandung 40132",
    totalShares: 800,
    pricePerShareLamports: 800_000,
    pricePerShareIDR: 200_000,
    annualYieldBps: 850,
    image: "/properties/dago.jpg",
  },
];

// Format Rupiah for display
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// Derive property PDA from name
export function getPropertyPDA(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("property"), Buffer.from(name)],
    PROGRAM_ID
  );
}

// Derive mint PDA from name
export function getMintPDA(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), Buffer.from(name)],
    PROGRAM_ID
  );
}

// Derive vault PDA from name
export function getVaultPDA(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), Buffer.from(name)],
    PROGRAM_ID
  );
}
