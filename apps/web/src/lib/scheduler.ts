import cron from "node-cron";

import { DEFAULT_PUBLISH_TIME, ENABLE_SCHEDULER } from "@/lib/config";
import { runIngestion } from "@/lib/ingest";
import { runPublish } from "@/lib/pipeline/publish";

let started = false;

function buildDailyCronExpression(time: string): string {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number.parseInt(hourRaw, 10);
  const minute = Number.parseInt(minuteRaw, 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return "0 9 * * *";
  }

  return `${minute} ${hour} * * *`;
}

export function startSchedulers(): void {
  if (started || !ENABLE_SCHEDULER) {
    return;
  }
  started = true;

  cron.schedule("0 */2 * * *", async () => {
    try {
      await runIngestion();
    } catch (error) {
      console.error("[scheduler] ingestion failed", error);
    }
  });

  cron.schedule(buildDailyCronExpression(DEFAULT_PUBLISH_TIME), async () => {
    try {
      await runPublish(new Date());
    } catch (error) {
      console.error("[scheduler] publish failed", error);
    }
  });
}
