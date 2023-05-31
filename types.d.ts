import {Decimal} from "decimal.js";

export interface Erc20Trx {
    blockNumber: string
    timeStamp: string
    hash: string
    nonce: string
    blockHash: string
    from: string
    contractAddress: string
    to: string
    value: string
    tokenName: string
    tokenSymbol: Tokens
    tokenDecimal: string
    transactionIndex: string
    gas: string
    gasPrice: string
    gasUsed: string
    cumulativeGasUsed: string
    input: string
    confirmations: string
}

export interface NormalTrx {
    blockNumber: string
    timeStamp: string
    hash: string
    nonce: string
    blockHash: string
    transactionIndex: string
    from: string
    to: string
    value: string
    gas: string
    gasPrice: string
    isError: string
    txreceipt_status: string
    input: string
    contractAddress: string
    cumulativeGasUsed: string
    gasUsed: string
    confirmations: string
    methodId: string
    functionName: string
}

export interface InternalTrx {
    blockNumber: string
    timeStamp: string
    hash: string
    from: string
    to: string
    value: string
    contractAddress: string
    input: string
    type: string
    gas: string
    gasUsed: string
    traceId: string
    isError: string
    errCode: string
}

export interface TrxHistory {
    contractAddress: string,
    tokenSymbol: Tokens,
    decimal: Decimal,
    tokenDecimal: number,
    amount: string,
    isDeposit: boolean,
    timeStamp: number
}

export interface Tick {
    close: string
    high: string
    low: string
    open: string
    periodStartUnix: number
}

export type Tokens = "WETH" | "WMATIC" | "WBTC" | "USDT" | "USDC" | "DAI" | "SUSHI" | "QUICK" | "AAVE"
export type History = {
    [key in Tokens]?: Tick[];
};
export type Balance = {
    id: number,
    timeStamp: number,
    balances: {
        [key in Tokens]?: string
    }
}

export interface Transactions {
    timestamp: string
    transaction: Transaction
    pool: Pool
    owner: string
    sender: string
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
    __typename: string
}

export interface Transaction {
    id: string
    __typename: string
}

export interface Pool {
    token0: Token0
    token1: Token1
    __typename: string
}

export interface Token0 {
    id: string
    symbol: string
    __typename: string
}

export interface Token1 {
    id: string
    symbol: string
    __typename: string
}