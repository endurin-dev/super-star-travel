/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      "images.unsplash.com",
      "s1.ticketm.net",
      "s2.ticketm.net",
      "s3.ticketm.net",
      // any other existing domains
    ],
  },
};

export default nextConfig;