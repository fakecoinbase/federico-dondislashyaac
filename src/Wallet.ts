import {
  generateKeyPairSync,
  createSign,
  createVerify
} from 'crypto'

export default class Wallet {
  readonly address: string
  readonly publicKey: string
  readonly privateKey: string

  constructor () {
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'sect239k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    this.publicKey = publicKey
    this.privateKey = privateKey

    this.address = publicKey
      .replace(/\n/g, '')
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
  }

  static getAddressAsPEM (address: string): string {
    return `
-----BEGIN PUBLIC KEY-----
${address}
-----END PUBLIC KEY-----
`
  }

  sign (hash: string): string {
    return createSign('RSA-SHA256')
      .update(hash)
      .sign(this.privateKey, 'hex')
  }

  verify (hash: string, signature: string): boolean {
    return createVerify('RSA-SHA256')
      .update(hash)
      .verify(this.publicKey, signature, 'hex')
  }
}
