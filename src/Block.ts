import { createHash } from 'crypto'

import Transaction from './Transaction'

export default class Block {
  private nonce = 0

  constructor (
    readonly parentHash: string,
    readonly stateHash: string,
    readonly minerAddress: string,
    readonly transactions: Transaction[]
  ) {
  }

  public get hash (): string {
    const json = JSON.stringify(
      this.parentHash +
      this.stateHash +
      this.minerAddress +
      this.transactions.map(t => t.hash) +
      this.nonce
    )

    return createHash('SHA256').update(json).digest('hex')
  }

  mine (difficulty: number, min = 0, max: number = Number.MAX_SAFE_INTEGER): Block {
    for (this.nonce = min;
      this.nonce < max;
      this.nonce++) {
      if (this.check(difficulty)) return this
    }

    throw new Error('Mining unsuccessful.')
  }

  check (difficulty: number): boolean {
    return this.hash.startsWith('0'.repeat(difficulty))
  }
}
