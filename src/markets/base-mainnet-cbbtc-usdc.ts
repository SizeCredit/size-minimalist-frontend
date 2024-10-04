import { Abi, Address } from 'viem';
import Size from '../abi/Size.json';
import PriceFeed from '../abi/PriceFeed.json';
import { erc20Abi } from 'viem';

export default {
  deployment: {
    Size: { abi: Size.abi as Abi, address: '0xB21Bbe052F5cE9ae681c59725f0A313765Fd016c' as Address, block: 20637165 },
    PriceFeed: { abi: PriceFeed.abi as Abi, address: '0x634160Ce49Fe29FC086E0B12230bD571c3A4858b' as Address, block: 20637164 },
    WETH: { abi: erc20Abi, address: '0x4200000000000000000000000000000000000006' as Address, block: 0 },
    UnderlyingCollateralToken: { abi: erc20Abi, address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as Address, block: 0 },
    UnderlyingBorrowToken: { abi: erc20Abi, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as Address, block: 0 },
  },
  tokens: {
    BorrowAToken: { decimals: 6, symbol: 'szUSDC' },
    UnderlyingBorrowToken: { decimals: 6, symbol: 'USDC' },
    UnderlyingCollateralToken: { decimals: 8, symbol: 'cbBTC' },
    CollateralToken: { decimals: 8, symbol: 'szcbBTC' },
    DebtToken: { decimals: 6, symbol: 'szDebtUSDC' }
  },
  minimumCreditAmount: 10
}

