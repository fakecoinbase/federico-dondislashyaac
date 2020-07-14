import {
  createHash,
  createSign,
  createVerify
} from 'crypto'

import Wallet from './Wallet'

export default class Transaction {
  readonly signature: string

  constructor (
    readonly amount: number,
    readonly fromAddress: string,
    readonly toAddress: string,
    readonly nonce: number,
    issuer: Wallet
  ) {
    this.signature = issuer.sign(this.hash)
  }

  readonly timestamp: number = Date.now()

  public get hash (): string {
    const json = JSON.stringify(
      this.amount +
      this.fromAddress +
      this.toAddress +
      this.timestamp +
      this.nonce
    )

    return createHash('SHA256').update(json).digest('hex')
  }

  verify (issuer: string): boolean {
    return createVerify('RSA-SHA256')
      .update(this.hash)
      .verify(issuer, this.signature, 'hex')
  }
}
