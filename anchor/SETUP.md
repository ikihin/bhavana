# Bhavana Anchor Program — Setup & Deploy

## Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable

# Install Solana CLI (v1.18+)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor CLI (v0.30+)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1
avm use 0.30.1
```

## Configure for Devnet

```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json  # Skip if exists
solana airdrop 5  # Get devnet SOL
```

## Build & Deploy

```bash
cd ~/bhavana/anchor

# Install JS dependencies
npm install

# Build the program
anchor build

# Get your program ID (replace in lib.rs and Anchor.toml)
solana address -k target/deploy/bhavana-keypair.json

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Seed the 3 properties
npx ts-node migrations/seed-properties.ts
```

## Test

```bash
anchor test  # Runs on local validator
```

## Program Architecture

```
PropertyAccount PDA: seeds = ["property", name]
├── admin: Pubkey (who can distribute yield)
├── name: String (max 64)
├── location: String (max 128)
├── total_shares: u64 (supply cap)
├── shares_sold: u64 (current sold)
├── price_per_share_lamports: u64
├── annual_yield_bps: u16
├── mint: Pubkey → Mint PDA: seeds = ["mint", name]
├── vault: Pubkey → Vault PDA: seeds = ["vault", name]
├── is_active: bool
└── bump: u8

Flow:
1. Admin calls initialize_property → creates PDA + mint + vault
2. Buyer calls buy_shares → SOL to vault, SPL tokens minted to buyer
3. Admin calls distribute_yield per holder → vault SOL sent pro-rata
```

## Property Data (Devnet)

| Property | Location | Shares | Price/Share | Yield |
|----------|----------|--------|-------------|-------|
| Kos Putri Malioboro | Yogyakarta | 1,000 | 600K lamports (≈Rp 150K) | 9.2% |
| Apartemen Sudirman Park | Jakarta Pusat | 500 | 2M lamports (≈Rp 500K) | 7.8% |
| Kos Premium Dago | Bandung | 800 | 800K lamports (≈Rp 200K) | 8.5% |
