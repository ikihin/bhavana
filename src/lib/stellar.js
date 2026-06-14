import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit'
import * as StellarSdk from '@stellar/stellar-sdk'

const NETWORK = WalletNetwork.TESTNET
const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const FRIENDBOT_URL = 'https://friendbot.stellar.org'

let kit = null

export function getKit() {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: NETWORK,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    })
  }
  return kit
}

export function connectWallet() {
  return new Promise((resolve, reject) => {
    const walletKit = getKit()
    walletKit.openModal({
      onWalletSelected: async (option) => {
        try {
          walletKit.setWallet(option.id)
          const { address } = await walletKit.getAddress()
          resolve(address)
        } catch (err) {
          reject(err)
        }
      },
      onClosed: (err) => {
        reject(err || new Error('Modal closed'))
      },
    })
  })
}

export async function disconnectWallet() {
  if (kit) {
    await kit.disconnect()
  }
  kit = null
}

export async function getBalance(address) {
  const server = new StellarSdk.Horizon.Server(HORIZON_URL)
  try {
    const account = await server.loadAccount(address)
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    )
    return xlmBalance ? xlmBalance.balance : '0'
  } catch (e) {
    if (e?.response?.status === 404) {
      return null
    }
    throw e
  }
}

export async function fundWithFriendbot(address) {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`)
  if (!response.ok) {
    throw new Error('Failed to fund account with Friendbot')
  }
  return response.json()
}

export async function sendPayment(destinationAddress, amount) {
  const walletKit = getKit()
  const { address: sourceAddress } = await walletKit.getAddress()

  const server = new StellarSdk.Horizon.Server(HORIZON_URL)
  const sourceAccount = await server.loadAccount(sourceAddress)

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: StellarSdk.Asset.native(),
        amount: String(amount),
      })
    )
    .setTimeout(30)
    .build()

  const xdr = transaction.toXDR()

  const { signedTxXdr } = await walletKit.signTransaction(xdr, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    address: sourceAddress,
  })

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedTxXdr,
    StellarSdk.Networks.TESTNET
  )

  const result = await server.submitTransaction(signedTx)
  return result
}
