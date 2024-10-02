import { createContext, ReactNode, useContext } from 'react';
import { useAccount } from 'wagmi';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { PositionsContext } from './PositionsContext';
import { Address, encodeFunctionData, erc20Abi } from 'viem';
import Size from '../abi/Size.json'
import { sendTransaction, writeContract } from 'wagmi/actions';
import { toast } from 'react-toastify';
import { Quote } from './SwapContext';
import { ethers } from 'ethers';

interface SizeContext {
  repay: (debtPositionId: string) => Promise<void>
  deposit: (token: string, amount: bigint) => Promise<void>,
  withdraw: (token: string, amount: bigint) => Promise<void>
  buyCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>
  sellCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>
  sellCreditMarket: (quote: Quote, amount: bigint, tenor: number) => Promise<void>
  buyCreditMarket: (quote: Quote, amount: bigint, tenor: number) => Promise<void>
}

export const SizeContext = createContext<SizeContext>({} as SizeContext);

type Props = {
  children: ReactNode;
};

export function SizeProvider({ children }: Props) {
  const account = useAccount()
  const { updatePositions } = useContext(PositionsContext)
  const { market } = useContext(ConfigContext)
  const { deployment } = market

  const repay = async (debtPositionId: string) => {
    const borrower = account.address
    const arg = {
      debtPositionId,
      borrower,
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'repay')],
      functionName: 'repay',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
      updatePositions()
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const deposit = async (token: string, amount: bigint) => {
    const to = account.address
    const arg = {
      to,
      token,
      amount
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'deposit')],
      functionName: 'deposit',
      args: [arg]
    })
    console.log(data)
    try {
      if (token !== deployment.WETH.address) {
        const approve = await writeContract(config, {
          abi: erc20Abi,
          functionName: 'approve',
          args: [deployment.Size.address, amount],
          address: token as Address
        })
        toast.success(<a target="_blank" href={`https://basescan.org/tx/${approve}`}>{approve}</a>)
      }
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data,
        value: token === deployment.WETH.address ? amount : BigInt(0)
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const withdraw = async (token: string, amount: bigint) => {
    const to = account.address
    const arg = {
      to,
      token,
      amount
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'withdraw')],
      functionName: 'withdraw',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const buyCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    const marketRateMultipliers = tenors.map(() => 0)
    const arg = {
      maxDueDate: Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365) / 1000),
      curveRelativeTime: {
        tenors,
        aprs,
        marketRateMultipliers
      }
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'buyCreditLimit')],
      functionName: 'buyCreditLimit',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const sellCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    const marketRateMultipliers = tenors.map(() => 0)
    const arg = {
      maxDueDate: Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365) / 1000),
      curveRelativeTime: {
        tenors,
        aprs,
        marketRateMultipliers
      }
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'sellCreditLimit')],
      functionName: 'sellCreditLimit',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const sellCreditMarket = async (quote: Quote, amount: bigint, tenor: number): Promise<void> => {
    const { user: lender, rate } = quote
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60
    const maxAPR = Math.floor(rate * 1.05 * 1e18)
    const exactAmountIn = true
    const creditPositionId = ethers.MaxUint256
    const arg = {
      lender,
      creditPositionId,
      amount,
      tenor,
      deadline,
      maxAPR,
      exactAmountIn
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'sellCreditMarket')],
      functionName: 'sellCreditMarket',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
      updatePositions()
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const buyCreditMarket = async (quote: Quote, amount: bigint, tenor: number): Promise<void> => {
    const { user: borrower, rate } = quote
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60
    const minAPR = Math.floor(rate * 1e18 / 1.05)
    const exactAmountIn = false
    const creditPositionId = ethers.MaxUint256
    const arg = {
      borrower,
      creditPositionId,
      amount,
      tenor,
      deadline,
      minAPR,
      exactAmountIn
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'buyCreditMarket')],
      functionName: 'buyCreditMarket',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(<a target="_blank" href={`https://basescan.org/tx/${tx}`}>{tx}</a>)
      updatePositions()
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }


  return (
    <SizeContext.Provider
      value={{
        repay,
        deposit,
        withdraw,
        sellCreditLimit,
        buyCreditLimit,
        sellCreditMarket,
        buyCreditMarket,
      }}
    >
      {children}
    </SizeContext.Provider>
  );
}
