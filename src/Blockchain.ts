import fs from 'fs'
import path from 'path'

import Account from './Account'
import Block from './Block'
import State from './State'
import Wallet from './Wallet'
import Transaction from './Transaction'

export default class Blockchain {
  private chain: Block[] = []
  private state: State = new State()

  constructor (
    private difficulty: number,
    private miningReward: number,
    private minerAddress: string,
    private startMiningAt: number,
    luckyDucklings: { [address: string]: Account }
  ) {
    this.chain.push(new Block(
      'parent-yaac',
      'parent-state',
      '',
      []
    ))

    Object.entries(luckyDucklings).forEach(([address, alloc]) => {
      this.state.allocateInitialAccount(
        address,
        alloc
      )
    })
  }

  public getDifficulty (): number {
    return this.difficulty
  }

  public getMiningReward (): number {
    return this.miningReward
  }

  getBalanceOf (address: string): number {
    return this.state.getBalanceOf(address)
  }

  getNonceOf (address: string): number {
    return this.state.getNonceOf(address)
  }

  mine (): void {
    const txs = this.state.getPendingTransactions()
    const txsToInclude: Transaction[] = []

    while (txs.length > 0) {
      const tx = txs.shift()!

      try {
        // Verify the signature...

        if (this.getNonceOf(tx.fromAddress) < tx.nonce) { throw new Error('Nonce not valid, possible replay attack.') }

        if (tx.amount <= 0) { throw new Error('Amount must be greater than 0.') }
        if (tx.amount > this.state.getBalanceOf(tx.fromAddress)) { throw new Error('Amount not available.') }

        this.state.commit(tx)

        txsToInclude.push(tx)
      } catch (e) {

      }
    }

    const newBlock = new Block(
      this.chain[this.chain.length - 1].hash,
      this.state.hash,
      this.minerAddress,
      txsToInclude
    ).mine(this.difficulty)

    this.chain.push(newBlock)
    this.state.withdraw(newBlock, this.miningReward)
  }

  createWallet (): Wallet {
    return this.state.createWallet()
  }

  createTransaction (sender: string, receiver: string, amount: number, issuer: Wallet): Transaction {
    const tx = this.state.createTransaction(
      sender,
      receiver,
      amount,
      issuer
    )

    if (this.state.getPendingTransactionsCount() === this.startMiningAt) { setTimeout(() => { this.mine() }, 0) }

    return tx
  }

  exportToJSON (): void {
    const dir = path.join(__dirname, '../yaac.blockchain')
    const json = JSON.stringify(this, null, 2)

    fs.writeFileSync(dir, json)
  }
}
