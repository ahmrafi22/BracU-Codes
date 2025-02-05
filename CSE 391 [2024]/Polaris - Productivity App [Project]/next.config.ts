const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',  
        hostname: 'files.edgestore.dev',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
      }
    ],
  },
};

export default nextConfig;