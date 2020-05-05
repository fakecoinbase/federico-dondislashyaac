import { createHash } from 'crypto'

import Wallet from './Wallet'
import Transaction from './Transaction'
import Account from './Account'
import Block from './Block'

export default class State {
  private readonly wallets: { [address: string]: Account } = { }
  private readonly transactions: Transaction[] = []

  public get hash (): string {
    const wls = Object.keys(this.wallets).sort()

    return createHash('SHA256')
      .update(
        JSON.stringify(wls) +
        JSON.stringify(wls.map(address => this.wallets[address])) +
        JSON.stringify(this.transactions)
      )
      .digest('hex')
  }

  allocateInitialAccount (address: string, account: Account): void {
    this.wallets[address] = account
  }

  commit (tx: Transaction): void {
    this.wallets[tx.fromAddress].nonce += 1

    this.wallets[tx.fromAddress].balance -= tx.amount
    this.wallets[tx.toAddress].balance += tx.amount
  }

  withdraw (block: Block, reward: number): void {
    this.wallets[block.minerAddress].balance += reward
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

  getPendingTransactions (of?: string): Transaction[] {
    return (of)
      ? this.transactions.filter(tx => tx.fromAddress === of)
      : this.transactions
  }

  getPendingTransactionsCount (of?: string): number {
    return this.getPendingTransactions(of).length
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

    const tx = new Transaction(
      amount,
      sender,
      receiver,
      this.getNonceOf(sender) + this.getPendingTransactionsCount(sender),
      issuer
    )

    this.transactions.push(tx)

    return tx
  }
}
