# Bhavana — Fractional Indonesian Property Investment on Solana

Bhavana democratizes property investment for 200M+ Indonesians locked out of real estate. Buy fractional ownership of kos-kosan (boarding houses) and apartments starting from Rp 150.000 (~$10), and earn rental yield distributed on-chain.

**Built with Claude Code + solana.new skills for the Superteam Agentic Engineering Grant.**

## Features

- **Anchor Smart Contract** — `initialize_property`, `buy_shares`, `distribute_yield` instructions with supply caps, SOL vault management, and pro-rata yield distribution
- **3 Real Indonesian Properties** — Kos Malioboro (Yogyakarta), Apartemen Sudirman (Jakarta), Kos Dago (Bandung) with real market yields (7.8-9.2%)
- **Phantom Wallet Integration** — Connect, buy shares, view portfolio
- **Rupiah-First UI** — All prices displayed in IDR with SOL equivalent
- **Portfolio Dashboard** — Track holdings, estimated monthly yield, total investment value
- **Yield Distribution Demo** — Admin simulates rental income distribution to token holders
- **Full Transaction States** — Idle → Pending → Confirmed/Error with Indonesian error messages

## Tech Stack

- **Smart Contract**: Anchor 0.30 (Rust) on Solana Devnet
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Wallet**: @solana/wallet-adapter (Phantom)
- **Tokens**: SPL Token (0-decimal, 1 token = 1 share)

## Architecture

```
anchor/programs/bhavana/src/lib.rs    ← Anchor program (394 lines)
├── PropertyAccount PDA: seeds = ["property", name]
├── Mint PDA: seeds = ["mint", name]
├── Vault PDA: seeds = ["vault", name]
│
src/
├── components/
│   ├── Navbar.tsx              ← Navigation + WalletMultiButton
│   ├── PropertyCard.tsx        ← Property listing with IDR pricing
│   ├── BuyModal.tsx            ← Purchase flow with state machine
│   ├── PortfolioDashboard.tsx  ← Holdings + yield summary
│   ├── YieldPanel.tsx          ← Admin yield distribution demo
│   └── Logo.tsx                ← Reusable logo component
├── hooks/
│   ├── useProperties.ts        ← Fetch PropertyAccount PDAs
│   ├── useBuyShares.ts         ← Call buy_shares instruction
│   ├── usePortfolio.ts         ← User's SPL token balances
│   └── useDistributeYield.ts   ← Admin yield distribution
├── lib/
│   ├── constants.ts            ← Program ID, RPC, property data, formatIDR()
│   ├── program.ts              ← Anchor program helpers
│   ├── WalletProvider.tsx      ← Solana wallet adapter setup
│   └── polyfills.ts            ← Buffer polyfill for browser
└── pages/
    ├── HomePage.tsx            ← Hero + stats + property preview
    ├── PropertiesPage.tsx      ← Full property grid
    └── PortfolioPage.tsx       ← Dashboard + yield panel
```

## Quick Start

### Frontend

```bash
git clone https://github.com/ikihin/bhavana.git
cd bhavana
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — connect Phantom wallet (set to Devnet).

### Smart Contract (requires Rust + Anchor CLI)

```bash
cd anchor
npm install
anchor build
anchor deploy --provider.cluster devnet
npx ts-node migrations/seed-properties.ts
```

See `anchor/SETUP.md` for full toolchain installation.

## Property Data (Devnet)

| Property | Location | Shares | Price/Share | Annual Yield |
|----------|----------|--------|-------------|--------------|
| Kos Putri Malioboro | Yogyakarta | 1,000 | Rp 150.000 | 9.2% |
| Apartemen Sudirman Park | Jakarta Pusat | 500 | Rp 500.000 | 7.8% |
| Kos Premium Dago | Bandung | 800 | Rp 200.000 | 8.5% |

## How It Works

1. **Admin initializes property** → Creates PDA + SPL mint + SOL vault
2. **Investor buys shares** → SOL transferred to vault, SPL tokens minted to buyer's ATA
3. **Admin distributes yield** → Vault SOL sent pro-rata to all token holders based on share ownership

## AI-Assisted Development

This project was built entirely using Claude Code with solana.new skills:
- `/competitive-landscape` — Market analysis (Parcl, RealT, Lofty comparison)
- `/roast-my-product` — Product critique and MVP scoping
- `/build-with-claude` — Anchor program, integration hooks, full UI components

Session transcript: [`claude-session.jsonl`](./claude-session.jsonl)

## Disclaimer

⚠️ This is a proof of concept on Solana Devnet. Not a real investment product. No real properties are tokenized. For demonstration and grant submission purposes only.

## License

MIT
