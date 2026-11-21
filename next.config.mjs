import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  // A static export has no image optimizer, so images from docs/assets/ are served as files.
  images: { unoptimized: true },
};

export default withMDX(config);
