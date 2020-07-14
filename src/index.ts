import Wallet from './Wallet'
import Blockchain from './Blockchain'

console.log('🚀 Getting started...')

const a = new Wallet()
const b = new Wallet()

const blockchain: Blockchain = new Blockchain(
  3,
  100,
  a.address,
  2,
  {
    [`${a.address}`]: { balance: 25, nonce: 0 },
    [`${b.address}`]: { balance: 50, nonce: 0 }
  }
)

blockchain.createTransaction(
  a.address,
  b.address,
  15,
  a
)

blockchain.createTransaction(
  b.address,
  a.address,
  10,
  b
)

blockchain.exportToJSON()
