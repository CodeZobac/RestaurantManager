import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'maps.googleapis.com',
            },
        ],
    },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);
