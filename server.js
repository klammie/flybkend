import express from 'express';
import { schedule } from 'node-cron';
import { processTrade, cryptoAcc } from './core.js';
const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.json()); // to parse JSON payload

const dynamicCronMap = {
  "1000L": ["10 */2 * * *", "55 */1 * * *", "49 */1 * * *"],     // 2h10m, 1h55m, 1h49m
  "3000L": ["44 */1 * * *", "41 */1 * * *", "37 */1 * * *"],     // 1h44m, 1h41m, 1h37m
  "5000L": ["32 */1 * * *", "27 */1 * * *", "21 */1 * * *"],     // 1h32m, 1h27m, 1h21m

  "10000L": ["15 */1 * * *", "11 */1 * * *", "8 */1 * * *"],     // 1h15m, 1h11m, 1h08m
  "20000L": ["5 */1 * * *", "20 */1 * * *", "0 */1 * * *"],      // 1h05m, 1h20m, 1h00m
  "30000L": ["*/58 * * * *", "*/56 * * * *", "*/54 * * * *"],    // 58m, 56m, 54m

  "50000L": ["*/45 * * * *", "*/40 * * * *", "*/37 * * * *"],    // 45m, 40m, 37m
  "100000L": ["*/35 * * * *", "*/29 * * * *", "*/26 * * * *"],   // 35m, 29m, 26m
  "200000L": ["*/21 * * * *", "*/18 * * * *", "*/14 * * * *"],   // 21m, 18m, 14m
}; 

const activeTasks = {};





function runScheduledTask(userId, cryptoId) {
  const intervals = dynamicCronMap[cryptoId];
  if (!intervals || intervals.length === 0) {
    console.warn(`No cron intervals for ${cryptoId}`);
    return;
  }

  const cronExpr = intervals[Math.floor(Math.random() * intervals.length)];
  const account = cryptoAcc.find(acc => acc.cryptoId === cryptoId);
  if (!account) {
    console.error(`No matching account config for cryptoId ${cryptoId}`);
    return;
  }

  account.id = userId; // Attach userId for trade logging
  account.cryptoId = cryptoId;

  if (activeTasks[cryptoId]) {
    activeTasks[cryptoId].stop();
  }

 activeTasks[cryptoId] = schedule(cronExpr, async () => {
  try {
    await processTrade(account);
  } catch (err) {
    console.error(`🔥 Trade execution failed for ${cryptoId}:`, err);
  }

  runScheduledTask(userId, cryptoId);
});

  console.log(`🎯 Scheduled ${cryptoId} for ${userId} @ interval ${cronExpr}`);
}
function stopScheduledTask(cryptoId) {
  if (activeTasks[cryptoId]) {
    activeTasks[cryptoId].stop();
    delete activeTasks[cryptoId];
    console.log(`🛑 Stopped cron for ${cryptoId}`);
  } else {
    console.log(`⚠️ No active cron for ${cryptoId}`);
  }
}

// POST endpoint
app.post('/trade', (req, res) => {
  const { userId, cryptoId } = req.body;

  if (!userId || !cryptoId) {
    return res.status(400).send("Missing userId or cryptoId");
  }

  if (activeTasks[cryptoId]) {
    stopScheduledTask(cryptoId);
    return res.send(`Stopped cron for ${cryptoId}`);
  } else {
    runScheduledTask(userId, cryptoId);
    return res.send(`Started dynamic cron for ${cryptoId}`);
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Fly.io!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});