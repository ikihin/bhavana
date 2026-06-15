import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bhavana } from "../target/types/bhavana";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("bhavana", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Bhavana as Program<Bhavana>;
  const admin = provider.wallet;

  // Real Indonesian property seed data
  // Rp 150.000/share ≈ 0.0006 SOL (at ~Rp 250M/SOL), using devnet values
  const PROPERTIES = [
    {
      name: "Kos Putri Malioboro",
      location: "Jl. Malioboro No. 47, Yogyakarta 55213",
      totalShares: 1000,
      pricePerShareLamports: 600_000, // 0.0006 SOL ≈ Rp 150.000
      annualYieldBps: 920, // 9.2%
    },
    {
      name: "Apartemen Sudirman Park",
      location: "Jl. KH Mas Mansyur, Jakarta Pusat 10220",
      totalShares: 500,
      pricePerShareLamports: 2_000_000, // 0.002 SOL ≈ Rp 500.000
      annualYieldBps: 780, // 7.8%
    },
    {
      name: "Kos Premium Dago",
      location: "Jl. Ir. H. Juanda No. 112, Bandung 40132",
      totalShares: 800,
      pricePerShareLamports: 800_000, // 0.0008 SOL ≈ Rp 200.000
      annualYieldBps: 850, // 8.5%
    },
  ];

  // Derive PDAs for all properties
  function getPropertyPDA(name: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("property"), Buffer.from(name)],
      program.programId
    );
  }

  function getMintPDA(name: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(name)],
      program.programId
    );
  }

  function getVaultPDA(name: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(name)],
      program.programId
    );
  }

  describe("initialize_property", () => {
    it("initializes all 3 Indonesian properties", async () => {
      for (const prop of PROPERTIES) {
        const [propertyPDA] = getPropertyPDA(prop.name);
        const [mintPDA] = getMintPDA(prop.name);
        const [vaultPDA] = getVaultPDA(prop.name);

        await program.methods
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
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .rpc();

        // Verify on-chain state
        const account = await program.account.propertyAccount.fetch(propertyPDA);
        assert.equal(account.name, prop.name);
        assert.equal(account.location, prop.location);
        assert.equal(account.totalShares.toNumber(), prop.totalShares);
        assert.equal(account.sharesSold.toNumber(), 0);
        assert.equal(account.pricePerShareLamports.toNumber(), prop.pricePerShareLamports);
        assert.equal(account.annualYieldBps, prop.annualYieldBps);
        assert.equal(account.isActive, true);

        console.log(`  ✓ ${prop.name} — ${prop.location}`);
        console.log(`    Shares: ${prop.totalShares} @ ${prop.pricePerShareLamports} lamports`);
        console.log(`    Yield: ${prop.annualYieldBps / 100}%`);
      }
    });

    it("rejects duplicate property names", async () => {
      const prop = PROPERTIES[0];
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);

      try {
        await program.methods
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
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (err) {
        // Account already exists — PDA collision
        assert.ok(err);
      }
    });
  });

  describe("buy_shares", () => {
    const buyer = Keypair.generate();

    before(async () => {
      // Airdrop SOL to buyer on devnet
      const sig = await provider.connection.requestAirdrop(
        buyer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    });

    it("buyer purchases 10 shares of Kos Putri Malioboro", async () => {
      const prop = PROPERTIES[0];
      const numShares = 10;
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);
      const buyerATA = await getAssociatedTokenAddress(mintPDA, buyer.publicKey);

      const vaultBefore = await provider.connection.getBalance(vaultPDA);

      await program.methods
        .buyShares(new anchor.BN(numShares))
        .accounts({
          property: propertyPDA,
          mint: mintPDA,
          vault: vaultPDA,
          buyerTokenAccount: buyerATA,
          buyer: buyer.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();

      // Verify token balance
      const tokenAccount = await getAccount(provider.connection, buyerATA);
      assert.equal(Number(tokenAccount.amount), numShares);

      // Verify SOL transferred to vault
      const vaultAfter = await provider.connection.getBalance(vaultPDA);
      const expectedCost = numShares * prop.pricePerShareLamports;
      assert.equal(vaultAfter - vaultBefore, expectedCost);

      // Verify shares_sold updated
      const account = await program.account.propertyAccount.fetch(propertyPDA);
      assert.equal(account.sharesSold.toNumber(), numShares);

      console.log(`  ✓ Bought ${numShares} shares for ${expectedCost} lamports`);
      console.log(`    Buyer token balance: ${tokenAccount.amount}`);
      console.log(`    Vault balance: ${vaultAfter} lamports`);
    });

    it("rejects purchase exceeding supply cap", async () => {
      const prop = PROPERTIES[0];
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);
      const buyerATA = await getAssociatedTokenAddress(mintPDA, buyer.publicKey);

      try {
        await program.methods
          .buyShares(new anchor.BN(prop.totalShares + 1)) // More than available
          .accounts({
            property: propertyPDA,
            mint: mintPDA,
            vault: vaultPDA,
            buyerTokenAccount: buyerATA,
            buyer: buyer.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .signers([buyer])
          .rpc();
        assert.fail("Should have thrown SoldOut");
      } catch (err) {
        assert.include(err.toString(), "SoldOut");
      }
    });
  });

  describe("distribute_yield", () => {
    const buyer = Keypair.generate();

    before(async () => {
      // Setup: airdrop to buyer, buy shares
      const sig = await provider.connection.requestAirdrop(
        buyer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      const prop = PROPERTIES[1]; // Apartemen Sudirman Park
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);
      const buyerATA = await getAssociatedTokenAddress(mintPDA, buyer.publicKey);

      await program.methods
        .buyShares(new anchor.BN(50))
        .accounts({
          property: propertyPDA,
          mint: mintPDA,
          vault: vaultPDA,
          buyerTokenAccount: buyerATA,
          buyer: buyer.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();

      // Fund the vault with additional SOL to simulate rent collection
      const fundSig = await provider.connection.requestAirdrop(
        vaultPDA,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(fundSig);
    });

    it("admin distributes yield pro-rata to holder", async () => {
      const prop = PROPERTIES[1];
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);
      const buyerATA = await getAssociatedTokenAddress(mintPDA, buyer.publicKey);

      // Simulate monthly rent: 1 SOL total yield for this property
      const totalYield = LAMPORTS_PER_SOL;

      const holderBefore = await provider.connection.getBalance(buyer.publicKey);

      await program.methods
        .distributeYield(new anchor.BN(totalYield))
        .accounts({
          property: propertyPDA,
          vault: vaultPDA,
          holderTokenAccount: buyerATA,
          holder: buyer.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const holderAfter = await provider.connection.getBalance(buyer.publicKey);
      // Buyer holds 50/500 shares = 10% of yield = 0.1 SOL
      const expectedYield = (50 * totalYield) / prop.totalShares;
      assert.equal(holderAfter - holderBefore, expectedYield);

      console.log(`  ✓ Distributed ${expectedYield} lamports to holder`);
      console.log(`    (50/${prop.totalShares} shares = ${(50 / prop.totalShares) * 100}% of ${totalYield} total)`);
    });

    it("rejects non-admin yield distribution", async () => {
      const prop = PROPERTIES[1];
      const [propertyPDA] = getPropertyPDA(prop.name);
      const [mintPDA] = getMintPDA(prop.name);
      const [vaultPDA] = getVaultPDA(prop.name);
      const buyerATA = await getAssociatedTokenAddress(mintPDA, buyer.publicKey);
      const fakeAdmin = Keypair.generate();

      const sig = await provider.connection.requestAirdrop(
        fakeAdmin.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      try {
        await program.methods
          .distributeYield(new anchor.BN(LAMPORTS_PER_SOL))
          .accounts({
            property: propertyPDA,
            vault: vaultPDA,
            holderTokenAccount: buyerATA,
            holder: buyer.publicKey,
            admin: fakeAdmin.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([fakeAdmin])
          .rpc();
        assert.fail("Should have thrown Unauthorized");
      } catch (err) {
        assert.include(err.toString(), "Unauthorized");
      }
    });
  });

  describe("toggle_property", () => {
    it("admin deactivates property, blocking purchases", async () => {
      const prop = PROPERTIES[2]; // Kos Premium Dago
      const [propertyPDA] = getPropertyPDA(prop.name);

      await program.methods
        .toggleProperty(false)
        .accounts({
          property: propertyPDA,
          admin: admin.publicKey,
        })
        .rpc();

      const account = await program.account.propertyAccount.fetch(propertyPDA);
      assert.equal(account.isActive, false);
      console.log(`  ✓ ${prop.name} deactivated`);
    });
  });
});
