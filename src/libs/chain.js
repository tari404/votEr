import Web3 from 'web3'
import Notify from 'bnc-notify'

import VoteRewardsABI from '@/libs/VoteRewards.abi.json'
import ERC20ABI from '@/libs/ERC20.abi.json'

import { aggregate } from '@makerdao/multicall'
const web3 = new Web3('')

export const config = {
  compToken: '0x36fec22Af9865Fb946B7Cf5E3eaf3E707D4DEDEa',
  daiToken: '0xDa2cb026db36baDf7525AB034ef86aD66AC31333',
  voterReward: '0xd36DA705EDC9EB629Ce8FC42455D8d00B7b7b174',
}

var notify = Notify({
  dappId: '7141f135-fc33-450d-8e88-b13d93103b0f',
  networkId: 42,
  darkMode: true,
})

export const setProvider = (provider) => {
  web3.setProvider(provider)
}

const fromWei = (input) => Web3.utils.fromWei(input.toString())

export const lib = {
  async approve(token, vr, account) {
    const bigNumber = '0x'.padEnd(24, 'f')
    const sendTx = new web3.eth.Contract(ERC20ABI, token).methods['approve'](vr, bigNumber)
      .send({
        from: account,
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
      console.warn(e)
      return ''
    })
  },

  async stake(vr, amount, account) {
    const sendTx = new web3.eth.Contract(VoteRewardsABI, vr).methods['stake'](amount)
      .send({
        from: account,
      })
      .catch((e) => {
        console.warn(e)
        return ''
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
      console.warn(e)
      return ''
    })
  },

  async withdraw(vr, amount, account) {
    const sendTx = new web3.eth.Contract(VoteRewardsABI, vr).methods['withdraw'](amount)
      .send({
        from: account,
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
      console.warn(e)
      return ''
    })
  },

  async getReward(vr, account) {
    const sendTx = new web3.eth.Contract(VoteRewardsABI, vr).methods['getReward']()
      .send({
        from: account,
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
      console.warn(e)
      return ''
    })
  },

  async exit(vr, account) {
    const sendTx = new web3.eth.Contract(VoteRewardsABI, vr).methods['exit']()
      .send({
        from: account,
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
      console.warn(e)
      return ''
    })
  },

  async addfun(vr, reward, link, account) {
    const sendTx = new web3.eth.Contract(VoteRewardsABI, vr).methods['addfun'](reward, link)
      .send({
        from: account,
      })
      .on('transactionHash', notify.hash)
    return sendTx.catch((e) => {
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

  async multicall(stakeToken, earnToken, voterReward, user) {
    //???????????? ????????????????????????????????????earn???????????????????????????????????????????????????????????????????????????
    //???????????? ???????????????????????????????????????earn??????????????????????????????
    // console.log(stakeToken, earnToken, voterReward, user)
    return aggregate(
      [
        {
          target: stakeToken,
          call: ['balanceOf(address)(uint256)', user],
          returns: [['stakeBalance', fromWei]],
        },
        {
          target: earnToken,
          call: ['balanceOf(address)(uint256)', user],
          returns: [['earnBalance', fromWei]],
        },
        {
          target: voterReward, // getStakeBalance
          call: ['balanceOf(address)(uint256)', user],
          returns: [['staking', fromWei]],
        },
        {
          target: voterReward, // getEarned
          call: ['earned(address)(uint256)', user],
          returns: [['earned', fromWei]],
        },
        {
          target: stakeToken,
          call: ['allowance(address,address)(uint256)', user, voterReward],
          returns: [['stakeTokenAllowance', fromWei]],
        },
        {
          target: earnToken,
          call: ['allowance(address,address)(uint256)', user, voterReward],
          returns: [['earnTokenAllowance', fromWei]],
        },
        {
          target: voterReward,
          call: ['sponsor()(address)'],
          returns: [['sponsor', (val) => val]],
        },
        {
          target: voterReward,
          call: ['sponsorshipAmount()(uint256)'],
          returns: [['sponsorshipAmount', fromWei]],
        },
        {
          target: voterReward,
          call: ['periodFinish()(uint256)'],
          returns: [['periodFinish', (val) => val * 1000]],
        },
        {
          target: voterReward,
          call: ['link()(string)'],
          returns: [['link', (val) => val]],
        },
      ],
      {
        rpcUrl: 'https://kovan.infura.io/v3/58efee0f91844be6ae8e0316e7ea7432',
        multicallAddress: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
      }
    )
      .then((res) => res.results.transformed)
      .catch(() => null)
  },
}
