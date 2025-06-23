import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Fetch Account Details Without Redis
export const getAccountById = async (provider, providerAccountId) => {
  return prisma.account.findFirst({
    where: { provider, providerAccountId },
  });
};

// ✅ Log Trade Execution in TradeLogs
export const addTradeLog = async (trade) => {
  return prisma.tradeLogs.create({
    data: {
      userId: trade.userId,
      crypto: trade.matchedCrypto.name,
      result: trade.result,
    },
  });
};

// ✅ Update Account Balance Correctly
export const updateTradeAccounts = async (userId, result) => {
  return prisma.user.update({
    where: { id: userId },
    data: { accBal: { increment: result } },
  });
};

// ✅ Update Trade Statistics in InvestmentSummary
export const updateTradeStats = async (userId, result) => {
  return prisma.investmentSummary.update({
    where: { id: userId },
    data: {
      wins: result > 0 ? { increment: 1 } : undefined,
      loss: result <= 0 ? { increment: 1 } : undefined,
    },
  });
};

// ✅ Process Trade Transaction Safely
export const processTradeTransaction = async (accountId, tradeData) => {
  await prisma.$transaction(async (tx) => {
    await tx.tradeLogs.create({
      data: {
        userId: tradeData.userId,
        crypto: tradeData.matchedCrypto.name,
        result: tradeData.result,
      },
    });

    await tx.user.update({
      where: { id: tradeData.userId },
      data: { accBal: { increment: tradeData.result } },
    });

    await tx.investmentSummary.update({
      where: { id: tradeData.userId },
      data:
        tradeData.result > 0
          ? { wins: { increment: 1 } }
          : { loss: { increment: 1 } },
    });
  });

  console.log('✅ Trade processed successfully!');
};