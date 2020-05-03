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

  createWallet (): Wallet {
    // TODO: notify the network of the new Wallet creation

    return this.state.createWallet()
  }

  createTransaction (sender: string, receiver: string, amount: number, issuer: Wallet): Transaction {
    // TODO: notify the network of the new Transaction creation

    return this.state.createTransaction(
      sender,
      receiver,
      amount,
      issuer
    )
  }
}
