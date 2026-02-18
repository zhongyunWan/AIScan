export const APP_NAME = "AIScan";

export const DEFAULT_PUBLISH_TIME = process.env.PUBLISH_TIME ?? "09:00";

export const ENABLE_SCHEDULER =
  (process.env.ENABLE_SCHEDULER ?? "true").toLowerCase() === "true";

export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

export const TREND_CATEGORY_ORDER = [
  "PRODUCT_HUNT_AI",
  "HUGGINGFACE_TRENDING",
  "REDDIT_DEV",
  "X_TWITTER_AI",
] as const;

export const DIGEST_TARGET_PER_CATEGORY = 20;
export const DIGEST_TARGET_SIZE = TREND_CATEGORY_ORDER.length * DIGEST_TARGET_PER_CATEGORY;
export const SIMILARITY_THRESHOLD = 0.88;
