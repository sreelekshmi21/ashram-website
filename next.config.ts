import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone',/* config options here */

  // Enable Next.js 16 Cache Components (`use cache` directive)
  cacheComponents: true,

  // Register Redis as the default cache handler
  cacheHandlers: {
    default: require.resolve("./cache-handlers/redis-cache-handler.js"),
  },

  // Custom cache lifetime profiles
  cacheLife: {
    // For content that changes infrequently (events, publications, gallery, news)
    content: {
      stale: 300,       // 5 minutes — client-side staleness
      revalidate: 600,  // 10 minutes — server revalidation interval
      expire: 86400,    // 24 hours — maximum cache lifetime
    },
    // For the homepage aggregate data
    homepage: {
      stale: 300,       // 5 minutes
      revalidate: 900,  // 15 minutes
      expire: 86400,    // 24 hours
    },
  },
};

export default nextConfig;
