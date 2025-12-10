/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net', 
      'images.unsplash.com', 
      'source.unsplash.com', 
      'api.unsplash.com', 
      'images.pexels.com', 
      'www.pexels.com',
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      'lh3.googleusercontent.com',
      'encrypted-tbn0.gstatic.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig

