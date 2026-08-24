/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // packages/ui duoc ship dang TS source (khong build san) — can transpile khi Next bundle.
  transpilePackages: ["@phumspace/ui"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=()" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
