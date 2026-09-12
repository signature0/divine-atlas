/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remote open-access image hosts only (verified, open license)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'thumb.wikimedia.org' },
    ],
  },
}

module.exports = nextConfig
