/**
 * MEV Bot Educational Demo
 * 教育性演示 MEV（最大可提取价值）交易策略概念
 */

import {
  MOCK_PRICES,
  MOCK_TRADES,
  MEV_STRATEGIES,
  generateTradeId,
  simulatePriceMovement,
  formatTrade
} from './mockData';

/**
 * MEV 交易机器人演示类
 * 仅用于教育目的，不连接真实区块链网络
 */
class MEVBot {
  private trades: any[] = [];
  private currentPrices = new Map<string, number>();

  constructor() {
    // 初始化价格
    MOCK_PRICES.forEach(price => {
      this.currentPrices.set(price.token, price.price);
    });
  }

  /**
   * 演示三明治攻击概念
   * @param targetToken 目标代币
   * @param targetAmount 目标数量
   */
  demonstrateSandwichAttack(targetToken: string, targetAmount: number): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 演示三明治攻击概念（教育性）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const currentPrice = this.currentPrices.get(targetToken) || 0;
    const frontRunPrice = currentPrice * 0.995; // 前置交易：稍微低一点的价格
    const backRunPrice = currentPrice * 1.005; // 后置交易：稍微高一点的价格

    // 1. 前置交易（Front-run）
    const frontTrade = {
      id: generateTradeId(),
      type: 'buy',
      token: targetToken,
      amount: targetAmount * 0.5,
      price: frontRunPrice,
      timestamp: Date.now() - 100
    };
    this.trades.push(frontTrade);
    console.log(`📍 步骤 1：前置交易（Front-run）`);
    console.log(`   ${formatTrade(frontTrade)}`);

    // 2. 模拟用户交易
    console.log(`📍 步骤 2：用户交易（被夹击的目标）`);
    console.log(`   ${targetAmount} ${targetToken} @ ${currentPrice.toFixed(2)}`);

    // 3. 后置交易（Back-run）
    const backTrade = {
      id: generateTradeId(),
      type: 'sell',
      token: targetToken,
      amount: targetAmount * 0.5,
      price: backRunPrice,
      timestamp: Date.now() + 100
    };
    this.trades.push(backTrade);
    console.log(`📍 步骤 3：后置交易（Back-run）`);
    console.log(`   ${formatTrade(backTrade)}`);

    // 计算收益
    const profit = (backRunPrice - frontRunPrice) * targetAmount;
    console.log('');
    console.log(`💰 预期收益：${profit.toFixed(2)} ${targetToken}`);
    console.log(`⚠️  这是教育性演示，实际 MEV 攻击对网络有害！`);
  }

  /**
   * 演示套利策略
   */
  demonstrateArbitrage(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 演示套利策略（教育性）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const dexA = 'DEX-A';
    const dexB = 'DEX-B';

    // 模拟两个 DEX 的价格差
    const priceA = MOCK_PRICES[0].price;
    const priceB = priceA * 1.02; // 2% 的价格差

    const opportunity = {
      source: dexA,
      target: dexB,
      token: 'ETH',
      buyPrice: priceA,
      sellPrice: priceB,
      profit: priceB - priceA
    };

    console.log(`💡 套利机会：`);
    console.log(`   从 ${dexA} 买入 @ ${priceA.toFixed(2)}`);
    console.log(`   在 ${dexB} 卖出 @ ${priceB.toFixed(2)}`);
    console.log(`   收益：${opportunity.profit.toFixed(2)}`);
  }

  /**
   * 显示 MEV 策略对比
   */
  displayStrategies(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MEV 策略对比');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    MEV_STRATEGIES.forEach(strategy => {
      console.log(``);
      console.log(`${strategy.id}. ${strategy.name}`);
      console.log(`   描述：${strategy.description}`);
      console.log(`   风险等级：${strategy.riskLevel.toUpperCase()}`);
      console.log(`   预期收益：${strategy.expectedProfit}%`);
    });
  }

  /**
   * 显示交易历史
   */
  displayTradeHistory(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📜 交易历史');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allTrades = [...MOCK_TRADES, ...this.trades];
    allTrades.forEach((trade, index) => {
      console.log(`${index + 1}. ${formatTrade(trade)}`);
    });
  }
}

// 演示主函数
function main(): void {
  const bot = new MEVBot();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  MEV 交易机器人 - 教育性演示                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('⚠️  免责声明：');
  console.log('   本演示仅用于教育目的，展示 MEV 攻击的工作原理。');
  console.log('   实际实施 MEV 攻击会对区块链网络造成伤害，且可能违法。');
  console.log('   请在法律允许的范围内使用区块链技术。');
  console.log('');

  // 1. 展示 MEV 策略
  bot.displayStrategies();
  console.log('');

  // 2. 演示套利
  bot.demonstrateArbitrage();
  console.log('');

  // 3. 演示三明治攻击
  bot.demonstrateSandwichAttack('ETH', 1.0);
  console.log('');

  // 4. 显示交易历史
  bot.displayTradeHistory();

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 演示完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 运行演示
main();
