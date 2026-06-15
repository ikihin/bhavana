/// Seed script: initializes 3 real Indonesian properties on devnet.
/// Run after `anchor deploy`: npx ts-node migrations/seed-properties.ts

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bhavana } from "../target/types/bhavana";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const PROPERTIES = [
  {
    name: "Kos Putri Malioboro",
    location: "Jl. Malioboro No. 47, Yogyakarta 55213",
    totalShares: 1000,
    pricePerShareLamports: 600_000, // ≈ Rp 150.000
    annualYieldBps: 920, // 9.2%
  },
  {
    name: "Apartemen Sudirman Park",
    location: "Jl. KH Mas Mansyur, Jakarta Pusat 10220",
    totalShares: 500,
    pricePerShareLamports: 2_000_000, // ≈ Rp 500.000
    annualYieldBps: 780, // 7.8%
  },
  {
    name: "Kos Premium Dago",
    location: "Jl. Ir. H. Juanda No. 112, Bandung 40132",
    totalShares: 800,
    pricePerShareLamports: 800_000, // ≈ Rp 200.000
    annualYieldBps: 850, // 8.5%
  },
];

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Bhavana as Program<Bhavana>;

  console.log("🏠 Seeding Bhavana properties on devnet...\n");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Admin: ${provider.wallet.publicKey.toString()}\n`);

  for (const prop of PROPERTIES) {
    const [propertyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("property"), Buffer.from(prop.name)],
      program.programId
    );
    const [mintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(prop.name)],
      program.programId
    );
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(prop.name)],
      program.programId
    );

    try {
      const tx = await program.methods
        .initializeProperty(
          prop.name,
          prop.location,
          new anchor.BN(prop.totalShares),
          new anchor.BN(prop.pricePerShareLamports),
          prop.annualYieldBps
        )
        .accounts({
          property: propertyPDA,
          mint: mintPDA,
          vault: vaultPDA,
          admin: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(`✅ ${prop.name}`);
      console.log(`   Location: ${prop.location}`);
      console.log(`   Shares: ${prop.totalShares} @ ${prop.pricePerShareLamports} lamports`);
      console.log(`   Yield: ${prop.annualYieldBps / 100}%`);
      console.log(`   PDA: ${propertyPDA.toString()}`);
      console.log(`   Mint: ${mintPDA.toString()}`);
      console.log(`   Tx: ${tx}\n`);
    } catch (err: any) {
      if (err.toString().includes("already in use")) {
        console.log(`⏭️  ${prop.name} — already initialized, skipping\n`);
      } else {
        console.error(`❌ ${prop.name} — ${err.message}\n`);
      }
    }
  }

  console.log("🎉 Seeding complete!");
}

main().catch(console.error);
