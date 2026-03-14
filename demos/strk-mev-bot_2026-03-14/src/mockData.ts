/**
 * Mock Trading Data
 * 模拟交易数据，用于 MEV 策略演示
 */

export interface TokenPrice {
  token: string;
  price: number;
  decimals: number;
}

export interface Trade {
  id: string;
  type: 'buy' | 'sell' | 'sandwich';
  token: string;
  amount: number;
  price: number;
  timestamp: number;
}

export interface SandwichStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedProfit: number;
}

// 模拟价格数据
export const MOCK_PRICES: TokenPrice[] = [
  { token: 'ETH', price: 2000.50, decimals: 18 },
  { token: 'USDC', price: 1.00, decimals: 6 },
  { token: 'DAI', price: 1.00, decimals: 18 }
];

// 模拟交易历史
export const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    type: 'buy',
    token: 'ETH',
    amount: 1.5,
    price: 2000.50,
    timestamp: Date.now() - 3600000
  },
  {
    id: '2',
    type: 'sell',
    token: 'ETH',
    amount: 1.0,
    price: 2005.75,
    timestamp: Date.now() - 1800000
  }
];

// MEV 策略定义
export const MEV_STRATEGIES: SandwichStrategy[] = [
  {
    id: 'sandwich-front-run',
    name: '三明治攻击（Front-run）',
    description: '在用户交易前插入交易，在用户交易后获利',
    riskLevel: 'high',
    expectedProfit: 5
  },
  {
    id: 'sandwich-back-run',
    name: '三明治攻击（Back-run）',
    description: '在用户交易后插入交易，利用价格滑点',
    riskLevel: 'medium',
    expectedProfit: 3
  },
  {
    id: 'arbitrage',
    name: '套利交易',
    description: '在不同 DEX 之间利用价格差异获利',
    riskLevel: 'low',
    expectedProfit: 2
  }
];

// 生成随机交易 ID
export function generateTradeId(): string {
  return `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 模拟价格波动
export function simulatePriceMovement(currentPrice: number): number {
  const change = (Math.random() - 0.5) * 0.02; // -1% 到 +1%
  return currentPrice * (1 + change);
}

// 格式化交易数据
export function formatTrade(trade: Trade): string {
  const type = trade.type.toUpperCase();
  const value = (trade.amount * trade.price).toFixed(2);
  const time = new Date(trade.timestamp).toLocaleTimeString();
  return `${type} ${trade.amount} ${trade.token} @ ${trade.price} (${time})`;
}
