const createMDX = require('@next/mdx');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [{ hostname: '**' }],
  },
};

const withMDX = createMDX({
  // Turbopack serializes plugin config, so reference remark/rehype plugins by
  // name (string) instead of importing the function directly.
  options: {
    remarkPlugins: [['remark-gfm']],
  },
});

module.exports = withMDX(nextConfig);
