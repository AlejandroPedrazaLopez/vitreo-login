/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
            {
                protocol: 'http',
                hostname: '*',
            }
        ],
    },
    // i18n: {
    //     locales: ["es", "en"],
    //     defaultLocale: "es",
    //     localeDetection: false,
    // },
}

module.exports = nextConfig
