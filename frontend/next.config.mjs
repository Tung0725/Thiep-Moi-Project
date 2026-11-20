/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const storageEndpoint = process.env.STORAGE_ENDPOINT || 'http://localhost:9000';
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'wedding-media';
    return [
      {
        source: '/templates/:template/:directory(assets|audio|fonts|ladi|opening|archive)/:path*',
        destination: `${storageEndpoint}/${bucketName}/templates/:template/:directory/:path*`,
      },
    ];
  },
};

export default nextConfig;
