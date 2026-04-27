import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.squarespace-cdn.com" },
      { hostname: "imageio.forbes.com" },
      { hostname: "bs-uploads.toptal.io" },
      { hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
