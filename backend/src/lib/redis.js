import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379"
});

// Events
redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

// Connect function
export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;