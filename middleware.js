import { NextResponse } from '@vercel/edge';

const TARGET_HOST = 'https://disotakyu.bunzhida.xyz';

const RULES = [
    {
        pattern: /^\/login\/?$/,
        transform: () => ({ path: '/account/login' })
    },
    {
        pattern: /^\/register\/?$/,
        transform: () => ({ path: '/account/register' })
    },
    {
        pattern: /^\/commissions\/([^/]+)\/edit\/?$/,
        transform: (match) => ({ path: `/commissions/edit/${match[1]}` })
    },
    {
        pattern: /^\/commissions\/([^/]+)\/delete\/?$/,
        transform: (match) => ({ path: `/commissions/delete/${match[1]}` })
    },
    {
        pattern: /^\/artworks\/([^/]+)\/?$/,
        transform: (match) => ({ path: `/artworks/${match[1]}` })
    },
    {
        pattern: /^\/artworks\/([^/]+)\/edit\/?$/,
        transform: (match) => ({ path: `/artworks/edit/${match[1]}` })
    },
    {
        pattern: /^\/artworks\/([^/]+)\/delete\/?$/,
        transform: (match) => ({ path: `/artworks/delete/${match[1]}` })
    },
    {
        pattern: /^\/commissions\/info\/?$/,
        transform: (_, searchParams) => {
            const id = searchParams.get('id');
            if (id) {
                const params = new URLSearchParams(searchParams);
                params.delete('id');
                const remainingQuery = params.toString();

                return {
                    path: `/commissions/info/${id}`,
                    queryString: remainingQuery ? `?${remainingQuery}` : ''
                };
            }
            return { path: '/commissions/info' };
        }
    }
];

export default function middleware(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    let targetPath = pathname;
    let targetQueryString = url.search;

    for (const rule of RULES) {
        const match = pathname.match(rule.pattern);
        if (match) {
            const result = rule.transform(match, searchParams);
            targetPath = result.path;
            if (result.queryString !== undefined) {
                targetQueryString = result.queryString;
            }
            break;
        }
    }

    const destination = `${TARGET_HOST}${targetPath}${targetQueryString}`;
    return NextResponse.redirect(destination, 307);
}

export const config = {
    matcher: '/:path*',
};