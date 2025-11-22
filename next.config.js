/** @type {import('next').NextConfig} */
const nextConfig = {
    // Trigger restart
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
