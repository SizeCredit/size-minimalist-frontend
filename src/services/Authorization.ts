export enum Action {
  DEPOSIT,
  WITHDRAW,
  BUY_CREDIT_LIMIT,
  SELL_CREDIT_LIMIT,
  BUY_CREDIT_MARKET,
  SELL_CREDIT_MARKET,
  SELF_LIQUIDATE,
  COMPENSATE,
  SET_USER_CONFIGURATION,
  COPY_LIMIT_ORDERS,
  // add more actions here
  NUMBER_OF_ACTIONS,
}

export type ActionsBitmap = bigint;

export const toBigInt = (actionsBitmap: ActionsBitmap): bigint => actionsBitmap;

export const nullActionsBitmap = (): ActionsBitmap => 0n;

export const isValid = (actionsBitmap: ActionsBitmap): boolean => {
  const maxValidBitmap = (1n << BigInt(Action.NUMBER_OF_ACTIONS)) - 1n;
  return toBigInt(actionsBitmap) <= maxValidBitmap;
};

export const isActionSet = (
  actionsBitmap: ActionsBitmap,
  action: Action,
): boolean => (toBigInt(actionsBitmap) & (1n << BigInt(action))) !== 0n;

export function getActionsBitmap(
  actionOrActions: Action | Action[],
): ActionsBitmap {
  // Check if the argument is an array
  if (Array.isArray(actionOrActions)) {
    const actions = actionOrActions;
    const combineBitmaps = (acc: bigint, action: Action): bigint =>
      acc | (1n << BigInt(action));

    return actions.reduce(combineBitmaps, 0n);
  } else {
    // Single action case
    const action = actionOrActions;
    return 1n << BigInt(action);
  }
}

export const Authorization = {
  toBigInt,
  nullActionsBitmap,
  isValid,
  isActionSet,
  getActionsBitmap,
};

export default Authorization;
