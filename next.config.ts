import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/jobs",
        destination: "/dashboard/seeker/jobs",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
