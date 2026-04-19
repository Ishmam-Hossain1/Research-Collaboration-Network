import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  if (process.env.DISABLE_RATE_LIMIT === "true") return next();

  try {
    const key = `rl:${req.ip}:${req.originalUrl}`;
    const { success } = await ratelimit.limit(key);

    if (!success) {
      return res.status(429).json({ message: "Too many requests" });
    }
    return next();
  } catch (err) {
    // optional: fail-open so it won't break your app
    return next();
  }
};

export default rateLimiter;
