# Bhavana — Real World Asset Tokenization on Stellar

Bhavana is a decentralized application (dApp) built on the Stellar blockchain that enables fractional property investment through tokenization. This Level 1 submission demonstrates core Stellar wallet integration, balance management, and XLM transactions on the testnet.

## Features

- **Wallet Connection** — Connect/disconnect via Stellar Wallets Kit (supports Freighter, xBull, Albedo, and more)
- **Balance Display** — Real-time XLM balance fetching from Stellar Testnet
- **Friendbot Funding** — One-click testnet account funding
- **Send XLM** — Transfer XLM to any Stellar testnet address with full transaction feedback
- **Transaction Feedback** — Success/failure states with transaction hash and explorer link

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Stellar SDK (`@stellar/stellar-sdk`)
- Stellar Wallets Kit (`@creit.tech/stellar-wallets-kit`)
- Stellar Testnet (Horizon)

## Prerequisites

1. Install the [Freighter Wallet](https://www.freighter.app/) browser extension
2. Create a Freighter account
3. Switch Freighter to **Testnet** (Settings → Network → Testnet)

## Setup Instructions

```bash
# Clone the repository
git clone https://github.com/ikihin/bhavana.git
cd bhavana

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Use

1. Click **Connect Wallet** to connect your Freighter wallet
2. If your account is new, click **Fund with Friendbot** to get 10,000 testnet XLM
3. Enter a destination address and amount to send XLM
4. Confirm the transaction in Freighter
5. View the transaction hash and click the explorer link to verify

## Screenshots

### Wallet Connected State
![Wallet Connected](./screenshots/wallet-connected.png)

### Balance Displayed
![Balance Display](./screenshots/balance-display.png)

### Successful Transaction
![Transaction Success](./screenshots/transaction-success.png)

### Transaction Result
![Transaction Result](./screenshots/transaction-result.png)

## Project Structure

```
bhavana/
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx    # Wallet connect/disconnect
│   │   ├── BalanceDisplay.jsx   # XLM balance & friendbot
│   │   └── SendPayment.jsx     # Send XLM transaction
│   ├── lib/
│   │   └── stellar.js          # Stellar SDK integration
│   ├── App.jsx                  # Main application
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind styles
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

## Roadmap

- **Level 2** — Smart contract escrow for property token purchases + multi-wallet integration
- **Level 3** — Production dApp with CI/CD, tests, and mobile responsive UI
- **Level 4+** — Property listing marketplace, fractional ownership, profit distribution

## License

MIT
