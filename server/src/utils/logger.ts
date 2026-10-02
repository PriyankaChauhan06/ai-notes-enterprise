const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  info(message: string, meta?: unknown) {
    if (!isProduction) {
      console.log(message, meta ?? "");
    }
  },

  error(message: string, error?: unknown) {
    console.error(message, error ?? "");
  },

  warn(message: string, meta?: unknown) {
    console.warn(message, meta ?? "");
  },
};
