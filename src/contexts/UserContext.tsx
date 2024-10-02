import { createContext, ReactNode, useContext } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { UserViewStruct } from '../typechain/Size';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { CreditPosition, DebtPosition, PositionsContext } from './PositionsContext';
import { Address, encodeFunctionData, erc20Abi } from 'viem';
import Size from '../abi/Size.json'
import { sendTransaction, writeContract } from 'wagmi/actions';
import { toast } from 'react-toastify';

interface UserContext {
  user?: UserViewStruct;
  debtPositions: DebtPosition[]
  creditPositions: CreditPosition[]
  repay: (debtPositionId: string) => Promise<void>
  deposit: (token: string, amount: bigint) => Promise<void>,
  withdraw: (token: string, amount: bigint) => Promise<void>
  buyCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>
  sellCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>
}

export const UserContext = createContext<UserContext>({} as UserContext);

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const account = useAccount()
  const { creditPositions, debtPositions } = useContext(PositionsContext)
  const { deployment } = useContext(ConfigContext)
  const getUserView = useReadContract({
    abi: deployment.Size.abi,
    address: deployment.Size.address,
    functionName: 'getUserView',
    args: [account.address],
    config,
  })
  const user = getUserView?.data as UserViewStruct | undefined

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
      toast.success(`https://basescan.org/tx/${tx}`)
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
        toast.success(`https://basescan.org/tx/${approve}`)
      }
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data,
        value: token === deployment.WETH.address ? amount : BigInt(0)
      })
      toast.success(`https://basescan.org/tx/${tx}`)
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
      toast.success(`https://basescan.org/tx/${tx}`)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const buyCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    const marketRateMultipliers = tenors.map(() => 0)
    const arg = {
      maxDueDate: Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365)/1000),
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
      toast.success(`https://basescan.org/tx/${tx}`)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const sellCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    const marketRateMultipliers = tenors.map(() => 0)
    const arg = {
      maxDueDate: Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365)/1000),
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
      toast.success(`https://basescan.org/tx/${tx}`)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        debtPositions: debtPositions.filter(position => position.borrower === account.address),
        creditPositions: creditPositions.filter(position => position.lender === account.address),
        repay,
        deposit,
        withdraw,
        buyCreditLimit,
        sellCreditLimit
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
