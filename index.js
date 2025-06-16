import { schedule } from "node-cron";

let scheduledTask;
let currentIndex = 0;
const dynamicIntervals = ["*/5 * * * *", "*/10 * * * *"]; // Every 5 or 10 minutes

function scheduleJob(cronExpression) {
  if (scheduledTask) scheduledTask.stop();

  scheduledTask = schedule(cronExpression, () => {
    console.log(`Job executed at: ${new Date().toISOString()}`);

    // Update scheduling after execution
    currentIndex = (currentIndex + 1) % dynamicIntervals.length;
    scheduleJob(dynamicIntervals[currentIndex]); 
  });

  console.log(`New job scheduled with interval: ${cronExpression}`);
}

// Start with the first cron interval
scheduleJob(dynamicIntervals[currentIndex]);