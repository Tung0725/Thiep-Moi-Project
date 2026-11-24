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
  async headers() {
    return [
      {
        source: '/login',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }],
      },
      {
        source: '/templates/ds03-sang-trong/runtime/v1/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
  async rewrites() {
    const storageEndpoint = process.env.STORAGE_ENDPOINT || 'http://localhost:9000';
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'wedding-media';
    return [
      {
        source: '/templates/:template/:directory(assets|audio|fonts|ladi|opening|archive|runtime)/:path*',
        destination: `${storageEndpoint}/${bucketName}/templates/:template/:directory/:path*`,
      },
    ];
  },
};

export default nextConfig;
