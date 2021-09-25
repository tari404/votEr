import Web3 from 'web3'

import VoteRewardsABI from '@/libs/VoteRewards.abi.json'
import ERC20ABI from '@/libs/ERC20.abi.json'

import { aggregate } from '@makerdao/multicall';
const web3 = new Web3('')

export const config = {
  compToken: '0x36fec22Af9865Fb946B7Cf5E3eaf3E707D4DEDEa',
  daiToken: '0xDa2cb026db36baDf7525AB034ef86aD66AC31333',
  voterReward: '0xd36DA705EDC9EB629Ce8FC42455D8d00B7b7b174',
}
  
export const setProvider = (provider) => {
  web3.setProvider(provider)
}

export const lib = {
  async getAllowance(token, account, spender) {
    return new web3.eth.Contract(ERC20ABI, token).methods['allowance'](account, spender)
      .call()
      .catch(() => '0')
  },

  async getBalance(token, account) {
    return new web3.eth.Contract(ERC20ABI, token).methods['balanceOf'](account)
      .call()
      .catch(() => '0')
  },
  async getStakeBalance(vr, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['balanceOf'](account)
      .call()
      .catch(() => '0')
  },
  async getEarned(vr, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['earned'](account)
      .call()
      .catch(() => '0')
  },

  async approve(token, vr, account) {
    const bigNumber = '0x'.padEnd(24, 'f')
    return new web3.eth.Contract(ERC20ABI, token).methods['approve'](vr, bigNumber)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },

  async stake(vr, amount, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['stake'](amount)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },

  async withdraw(vr, amount, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['withdraw'](amount)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },

  async exit(vr, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['exit']()
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },

  async getReward(vr, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['getReward']()
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },

  async getInfo(vr) {
    const ms = new web3.eth.Contract(VoteRewardsABI, vr).methods
    return Promise.all([
      ms['sponsor']().call(),
      ms['sponsorshipAmount']().call(),
      ms['link']().call(),
      ms['periodFinish']().call(),
    ])
  },
  async addfun(vr, reward, link, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['addfun'](reward, link)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },
  async delegate(vr, addr, account) {
    return new web3.eth.Contract(VoteRewardsABI, vr).methods['delegate'](addr)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
  },
  async getDelegates(token, vr) {
    return new web3.eth.Contract(ERC20ABI, token).methods['delegates'](vr)
      .call()
      .catch(() => '0x')
  },

  async mkrVote(vr, argus, from) {
    const ms = new web3.eth.Contract(VoteRewardsABI, vr).methods
    if (Array.isArray(argus)) {
      return ms['vote(address[])'](argus).send({ from })
    } else {
      return ms['vote(bytes32)'](argus).send({ from })
    }
  },

  async mkrVotePoll(vr, argu1, argu2, from) {
    const ms = new web3.eth.Contract(VoteRewardsABI, vr).methods
    if (Array.isArray(argu1)) {
      return ms['vote(uint256[],uint256[])'](argu1, argu2).send({ from })
    } else {
      return ms['vote(uint256,uint256)'](argu1, argu2).send({ from })
    }
  },

  async multicall(stakeToken,earnToken,voterReward,user){
    //依次查询 用户质押代币的余额、用户earn代币余额、已经存入多少代币到合约、可以领取的奖励、
    //依次查询 质押代币授权给合约的额度、earn代币授权给合约的额度
    console.log(stakeToken,earnToken,voterReward,user)
    return await aggregate(
      [
        {
          target: stakeToken,
          call: ['balanceOf(address)(uint256)', user],
          returns: [['mystakeBalance', val => val / 10 ** 18]]
        },
        {
          target: earnToken,
          call: ['balanceOf(address)(uint256)', user],
          returns: [['myearnBalance', val => val / 10 ** 18]]
        },
        {
          target: voterReward, // getStakeBalance
          call: ['balanceOf(address)(uint256)', user],
          returns: [['Stake', val => val / 10 ** 18]]
        },
        {
          target: voterReward, // getEarned
          call: ['earned(address)(uint256)', user],
          returns: [['Earned', val => val / 10 ** 18]]
        }, 
        {
          target: stakeToken, 
          call: ['allowance(address,address)(uint256)', user,voterReward],
          returns: [['allowance_stakeToken', val => val / 10 ** 18]]
        },
        {
          target: earnToken,
          call: ['allowance(address,address)(uint256)', user,voterReward],
          returns: [['allowance_earnToken', val => val / 10 ** 18]]
        },
        {
          target: voterReward,
          call: ['sponsor()(address)'],
          returns: [['sponsor', val => val]]
        },
        {
          target: voterReward,
          call: ['sponsorshipAmount()(uint256)'],
          returns: [['sponsorshipAmount', val => val / 10 ** 18]]
        },
        {
          target: voterReward,
          call: ['periodFinish()(uint256)'],
          returns: [['periodFinish', val => val]]
        },{
          target: voterReward,
          call: ['link()(string)'],
          returns: [['link', val => val]]
        },
      ],
      {
        rpcUrl: 'https://kovan.infura.io/v3/58efee0f91844be6ae8e0316e7ea7432',
        multicallAddress: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a'
      }
    );
  }
}
