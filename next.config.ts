import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Capas no Storage do Supabase (bucket público reels-capas).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dtkjdgixksqevkzfucwl.supabase.co",
        pathname: "/storage/v1/object/public/reels-capas/**",
      },
    ],
  },
};

export default nextConfig;
