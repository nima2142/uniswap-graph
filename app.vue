<template>
  <NuxtLoadingIndicator/>
  <div class="p-4 flex flex-col gap-4 items-stretch">
    <p>address: {{ address }}</p>
    <div v-if="loading">
      loading...
    </div>
    <TrendChart v-else v-if="result?.length" class="h-150" :interactive="true" @mouse-move="chartHover" :datasets="[
        {
          data: balanceHistory.map(e => parseFloat(e.balance)),
          smooth: false,
          fill: true,
          showPoints: true
        }
      ]" :grid="{
        // verticalLines: true,
        horizontalLines: true
      }" :labels="{
         xLabels: balanceHistory.map(e => e.timestamp),
         yLabels: 10
      }"/>
    <div class="bg-gray-600 text-white py-2 px-4">
      {{ currentData }}
    </div>
    <div class="bg-gray-600 text-white py-2 px-4">
      total profit/loss : {{ currentProfit }}%
    </div>
    <div class="bg-gray-600 text-white py-2 px-4">
      selected profit/loss : {{ profit }}%
    </div>
    <div class="flex gap-2 items-center">
      <button v-for="item in ['Swaps','Mints','Burns']" @click="tab=item.toLowerCase()"
              class="border-1 border-gray-500 rounded-lg py-2 px-4"
              :class="{'font-bold':item.toLowerCase()===tab}">{{ item }}
      </button>
    </div>
    <table class="table">
      <tr>
        <th>txHash</th>
        <th>Poll</th>
        <th>amount0</th>
        <th>amount1</th>
        <th>amountUSD</th>
      </tr>
      <tr v-for="row in transactions.data[tab]">
        <td>{{ row.transaction.id }}</td>
        <td>{{ row.pool.token0.symbol }} / {{ row.pool.token1.symbol }}</td>
        <td>{{ row.amount0 }}</td>
        <td>{{ row.amount1 }}</td>
        <td>{{ row.amountUSD }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import {Decimal} from 'decimal.js';
import _ from 'lodash'
import {Balance, Erc20Trx, History, InternalTrx, NormalTrx, Tick, Tokens, Transactions, TrxHistory} from "~/types";

const route = useRoute()
const day = 10
const tab = ref('swaps')

// const address = ref('0x6813ad11cca98e15ff181a257a3c2855d1eee69e')
const address: string = route.query.address || '0x4cd901148C5AA2D928346F39ddc043479EF30cbB'
const loading = ref(true)

const date = new Date()
date.setDate(date.getDate() - day)
const timestamp = Math.floor(date.getTime() / 1000)

const whiteList: {
  [key: string]: Tokens
} = {
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": "WETH",
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270": "WMATIC",
  "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6": "WBTC",
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": "USDT",
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "USDC",
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": "DAI",
  "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a": "SUSHI",
  "0x831753dd7087cac61ab5644b308642cc1c33dc13": "QUICK",
  "0xd6df932a45c0f255f85145f286ea0b292b21c90b": "AAVE",
}
const whiteListSymbols = Object.values(whiteList)

const {data} = await useFetch<{ status: string, message: string, result: Erc20Trx[] }>('https://api.polygonscan.com/api', {
  method: 'get',
  params: {
    module: "account",
    action: "tokentx",
    // contractaddress:"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    address: address,
    startblock: "0",
    endblock: "99999999",
    page: 1,
    offset: 0,
    sort: "asc",
    apikey: "GMS7FCFGRUT9EIDUUFPKG4ZR9CTKKQ733H",
  }
})
let result : TrxHistory[] = data.value?.result?.filter?.(e => whiteListSymbols.includes(e.tokenSymbol)).map(e => {
  const {contractAddress, tokenSymbol, tokenDecimal, timeStamp} = e
  const decimal = new Decimal(`1e${tokenDecimal}`)
  const amount = new Decimal(e.value)
  const isDeposit = e.to === address?.toLowerCase()
  return {
    contractAddress,
    tokenSymbol,
    decimal,
    tokenDecimal: parseInt(tokenDecimal),
    amount: amount.div(decimal).times(isDeposit ? '1' : '-1').toFixed(parseInt(tokenDecimal)),
    isDeposit,
    timeStamp : parseInt(timeStamp)
  }
}) || []

const {data: normalTrx} = await useFetch<{ status: string, message: string, result: NormalTrx[] }>('https://api.polygonscan.com/api', {
  method: 'get',
  params: {
    module: "account",
    action: "txlist",
    // contractaddress:"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    address: address,
    startblock: "0",
    endblock: "99999999",
    page: 1,
    offset: 0,
    sort: "asc",
    apikey: "GMS7FCFGRUT9EIDUUFPKG4ZR9CTKKQ733H",
  }
})
const {data: internalTrx} = await useFetch<{ status: string, message: string, result: InternalTrx[] }>('https://api.polygonscan.com/api', {
  method: 'get',
  params: {
    module: "account",
    action: "txlistinternal",
    address: address,
    startblock: "0",
    endblock: "99999999",
    page: 1,
    offset: 0,
    sort: "asc",
    apikey: "GMS7FCFGRUT9EIDUUFPKG4ZR9CTKKQ733H",
  }
})
if (normalTrx.value && internalTrx.value) {
  const maticTrx : TrxHistory[] = [...normalTrx.value.result, ...internalTrx.value.result].filter(e => e.value !== "0" && e.isError === "0").map(e => {
    const {timeStamp} = e
    const decimal = new Decimal(`1e18`)
    const amount = new Decimal(e.value)
    const isDeposit = e.to === address?.toLowerCase()
    return {
      contractAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      tokenSymbol: "WMATIC",
      decimal: new Decimal(18),
      tokenDecimal: 18,
      amount: amount.div(decimal).times(isDeposit ? '1' : '-1').toFixed(18),
      isDeposit,
      timeStamp:parseInt(timeStamp)
    }
  })
  result = _.sortBy([...result,...maticTrx],['timeStamp'])
}
// @ts-ignore
let balances: Balance[] = result?.reduce((p, c) => {
  const {timeStamp,tokenSymbol,tokenDecimal,amount} = c
  const prv = p?.length ? p[p.length - 1] : {balances: {}}
  const CAmount = new Decimal(amount)
  //@ts-ignore
  const PAmount = new Decimal(prv.balances[tokenSymbol] || 0)
  return [...p, {
    timeStamp,
    id: p?.length,
    balances: {
      ...prv.balances,
      [tokenSymbol]: PAmount.add(CAmount).toFixed(tokenDecimal),
    }
  }]
}, [])

//@ts-ignore
balances = balances?.filter(e => e.timeStamp >= timestamp)

const contracts = [...new Set(result?.map(e => e.contractAddress))]
let history: History = {}
for (const contract of contracts) {
  const {data} = await useFetch<{ data: { tokenHourDatas: Tick[] } }, string, string, 'post' | 'get'>('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon', {
    method: 'post',
    body: {
      operationName: "tokenHourDatas",
      variables: {
        address: contract,
        startTime: timestamp,
        skip: 0,
        limit: 24 * day
      },
      query: `query tokenHourDatas($limit: Int!, $startTime: Int!, $skip: Int!, $address: Bytes!) {
  tokenHourDatas(
    first: $limit
    skip: $skip
    where: {token: $address, periodStartUnix_gt: $startTime}
    orderBy: periodStartUnix
    orderDirection: asc
  ) {
    periodStartUnix
    high
    low
    open
    close
    __typename
  }
}`
    }
  })
  history = {
    ...history,
    [whiteList[contract]]: data?.value?.data?.tokenHourDatas
  }
}

const getPrice = (tokenSymbol: Tokens, timestamp: number,) => {
  const prices = history[tokenSymbol]?.filter(e => e.periodStartUnix > timestamp) || [{close: "0"}]
  return prices[prices?.length - 1]?.close || "0"
}

const balanceHistory = balances?.map(e => {
  //@ts-ignore
  const balance: Decimal = Object.entries(e.balances).reduce((balance, token: [Tokens, string]) => {
    const price = new Decimal(getPrice(token[0], e.timeStamp))
    const amount = new Decimal(token[1])
    const overall = price.times(amount)
    return balance.add(overall)
  }, new Decimal("0"))
  return {
    timestamp: new Date(e.timeStamp * 1000).toISOString(),
    balance: balance.toFixed(6)
  }
})

const {data: transactions} = await useFetch<{ data: { [key in 'mints' | 'swaps' | 'burns']: Transactions[] } }, string, string, 'post' | 'get'>('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon', {
  method: 'post',
  body: {
    operationName: "transactions",
    variables: {
      address: address,
    },
    query: `query transactions($address: Bytes!) {
  mints: mints(
    first: 100
    orderBy: timestamp
    orderDirection: desc
    where: {origin: $address}
    subgraphError: allow
  ) {
    timestamp
    transaction {
      id
      __typename
    }
    pool {
      token0 {
        id
        symbol
        __typename
      }
      token1 {
        id
        symbol
        __typename
      }
      __typename
    }
    owner
    sender
    origin
    amount0
    amount1
    amountUSD
    __typename
  }
  swaps: swaps(
    first: 100
    orderBy: timestamp
    orderDirection: desc
    where: {origin: $address}
    subgraphError: allow
  ) {
    timestamp
    transaction {
      id
      __typename
    }
    pool {
      token0 {
        id
        symbol
        __typename
      }
      token1 {
        id
        symbol
        __typename
      }
      __typename
    }
    origin
    amount0
    amount1
    amountUSD
    __typename
  }
  burns: burns(
    first: 100
    orderBy: timestamp
    orderDirection: desc
    where: {origin: $address}
    subgraphError: allow
  ) {
    timestamp
    transaction {
      id
      __typename
    }
    pool {
      token0 {
        id
        symbol
        __typename
      }
      token1 {
        id
        symbol
        __typename
      }
      __typename
    }
    owner
    amount0
    amount1
    amountUSD
    __typename
  }
}`
  }
})

const currentData = ref(balanceHistory?.[balanceHistory?.length - 1])
const firstBalance = new Decimal(balanceHistory?.[0]?.balance || "0")
const lastBalance = new Decimal(balanceHistory?.[balanceHistory?.length - 1]?.balance || "0")
const selectedBalance = ref(new Decimal(balanceHistory?.[balanceHistory?.length - 1]?.balance || "0"))
const currentProfit = lastBalance.minus(firstBalance).div(firstBalance).times(100)
const profit = computed(() => selectedBalance.value.minus(firstBalance).div(firstBalance).times(100))
const chartHover = (params: { index: number, data: number }) => {
  currentData.value = [balanceHistory[params.index], balances[params.index]]
  selectedBalance.value = new Decimal(currentData.value[0].balance)
}

loading.value = false
</script>

<style>
.x-labels .label text {
  transform: rotate(-90deg) translateY(-32%) translateX(-100px);
}

table th, table td {
  border: 1px solid black;
  padding: 0 10px;
}
</style>
