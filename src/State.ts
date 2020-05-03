import { createHash } from 'crypto'

import Wallet from './Wallet'
import Transaction from './Transaction'
import Account from './Account'

export default class State {
  private readonly wallets: { [address: string]: Account } = { }
  private readonly transactions: { [hash: string]: Transaction } = { }

  public get hash (): string {
    const wls = Object.keys(this.wallets).sort()
    const txs = Object.keys(this.transactions).sort()

    return createHash('SHA256')
      .update(
        JSON.stringify(wls) +
        JSON.stringify(wls.map(address => this.wallets[address])) +
        JSON.stringify(txs) +
        JSON.stringify(txs.map(hash => this.transactions[hash]))
      )
      .digest('hex')
  }

  allocateInitialAccount (address: string, account: Account): void {
    this.wallets[address] = account
  }

  commit (arg: Transaction): void {
    delete this.transactions[arg.hash]

    this.wallets[arg.fromAddress].balance -= arg.amount
    this.wallets[arg.toAddress].balance += arg.amount

    this.wallets[arg.fromAddress].nonce += 1
  }

  getBalanceOf (address: string): number {
    if (this.wallets[address]) {
      return this.wallets[address].balance
    } else {
      throw new Error('Wallet not found.')
    }
  }

  getNonceOf (address: string): number {
    if (this.wallets[address]) {
      return this.wallets[address].nonce
    } else {
      throw new Error('Wallet not found.')
    }
  }

  getPendingTransactionsOf (address: string): Transaction[] {
    const txs: Transaction[] = []

    Object.entries(this.transactions).forEach(([hash, tx]) => {
      if (tx.fromAddress === address) {
        txs.push(tx)
      }
    })

    return txs
  }

  getPendingTransactionsCountOf (address: string): number {
    return this.getPendingTransactionsOf(address).length
  }

  createWallet (): Wallet {
    const w = new Wallet()

    this.wallets[w.address] = {
      balance: 0,
      nonce: 0
    }

    return w
  }

  createTransaction (sender: string, receiver: string, amount: number, issuer: Wallet): Transaction {
    if (this.wallets[sender] === undefined) { throw new Error('Sender not found.') }
    if (this.wallets[receiver] === undefined) { throw new Error('Receiver not found.') }

    if (amount <= 0) { throw new Error('Amount must be greater than 0.') }
    if (amount > this.getBalanceOf(sender)) { throw new Error('Amount not available.') }

    const t = new Transaction(
      amount,
      sender,
      receiver,
      this.getNonceOf(sender) + this.getPendingTransactionsCountOf(sender),
      issuer
    )

    this.transactions[t.hash] = t

    return t
  }
}
