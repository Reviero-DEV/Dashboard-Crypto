const BASE_URL = ' https://api.coingecko.com/api/v3';
export async function getTopCoins(currency = 'usd') {
    const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page1&price_change_percentage=24h,7d`
    );
    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar dados da API`);
    }
    return response.json();
}

export async function getCoinChart(coinId, days = 30, currency = 'usd') {
    const response = await fetch(
        `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
    );
    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar dados do gráfico`);
    }
    return response.json();
}

export async function getTrending(coins = 7) {
    const response = await fetch(
        `${BASE_URL}/search/trending`
    );
    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar dados de tendências`);
    }
    const data = await response.json();
    return data.coins.map(c => c.item.id);
}

export async function getCardHighlights() {
    try {
        const coinsIds = await getTrending();
        const ids = coinsIds.slice(0, 7).join(',');
        const response = await fetch(
            `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=7&page=1&price_change_percentage=24h,7d`
        );
        if (!response.ok) {
            throw new Error(`Erro ${response.status} ao buscar dados da API para destaques`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar destaques', error.message);
        return [];
    }
}

export async function topGainers() {
    const idsHigh = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h`);
    const data = await idsHigh.json();
    return data;
}

export async function overviewMarket() {
    const response = await fetch(
        `${BASE_URL}/global`
    );
    const data = await response.json();
    return data.data;
}

export async function marketNews() {
    try {

        const [res1, res2] = await Promise.all([
            fetch('https://api.rss2json.com/v1/api.json?rss_url=https://portaldobitcoin.uol.com.br/feed/'),
            fetch('https://api.rss2json.com/v1/api.json?rss_url=https://livecoins.com.br/feed/')
        ]);

        if (!res1.ok || !res2.ok) {
            throw new Error('Erro ao buscar feeds');
        }

        const [feed1, feed2] = await Promise.all([
            res1.json(),
            res2.json()
        ]);
        const allNews = [...feed1.items, ...feed2.items];

        return allNews;
    } catch (error) {
        console.error('Erro ao carregar news destaques', error.message);
        return {
            status: 'fallback',
            items: [
                {
                    title: 'Bitcoin mantem consolidação acima de $30.000',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Crypto News'
                },
                {
                    title: 'Ethereum 2.0: O que esperar da atualização',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Blockchain Today'
                },
                {
                    title: 'Altcoins ganham força no mercado em alta',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Altcoin Daily'
                },
                {
                    title: 'Análise técnica: Principais níveis de suporte e resistência',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Crypto Analysis'
                },
                {
                    title: 'Regulamentação cripto: Impactos no mercado global',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Finance Today'
                },
                {
                    title: 'NFTs continuam a revolucionar o mercado digital',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Digital Art News'
                },
                {
                    title: 'DeFi: O futuro das finanças descentralizadas',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'DeFi Weekly'
                },
                {
                    title: 'Ethereum 3.0: Comunidade aprova nova fase de escalabilidade para março',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Tech Radar'
                },
                {
                    title: 'Solana ultrapassa volume diário do Ethereum em mercados NFT',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Solana Daily'
                },
                {
                    title: 'Banco Central do Brasil anuncia novos testes com contratos inteligentes no DREX',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Valor Econômico'
                },
                {
                    title: 'Bitcoin rompe resistência histórica e busca novos alvos em $125.000',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Crypto News'
                },
                {
                    title: 'Ethereum registra queda nas taxas de gás após implementação de novo EIP',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Ether World'
                },
                {
                    title: 'Solana lança Saga Phone 3 com foco em IA e pagamentos nativos',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Solana Daily'
                },
                {
                    title: 'Ripple (XRP) vence última etapa judicial e expande operações na Ásia',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Finance Magnates'
                },
                {
                    title: 'CVM brasileira aprova novo ETF focado em Real World Assets (RWA)',
                    link: '#',
                    pubDate: new Date().toISOString(),
                    author: 'Valor Econômico'
                },
                // --------------//
                {
                    title: 'Regulação Cripto: G20 estabelece padrões globais para stablecoins',
                    link: '#',
                    pubDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Reuters'
                },
                {
                    title: 'Chainlink integra sistemas de pagamento Swift para ativos tokenizados',
                    link: '#',
                    pubDate: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
                    author: 'Blockchain Insider'
                },
                {
                    title: 'Nvidia lança chips otimizados para mineração sustentável de ZK-Proofs',
                    link: '#',
                    pubDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Hardware Zone'
                },
                {
                    title: 'Adoção de Lightning Network cresce 300% em pagamentos de varejo na América Latina',
                    link: '#',
                    pubDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Crypto Economy'
                },
                {
                    title: 'Hacker devolve $40 milhões após falha em protocolo de empréstimo DeFi',
                    link: '#',
                    pubDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Security Watch'
                },
                {
                    title: 'Cardano finaliza transição para governança 100% on-chain',
                    link: '#',
                    pubDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Cardano Feed'
                },
                {
                    title: 'Tokens de Real World Assets (RWA) atingem capitalização recorde',
                    link: '#',
                    pubDate: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
                    author: 'Forbes'
                },
                {
                    title: 'Polkadot 2.0: Nova arquitetura de leilões reduz custos para desenvolvedores',
                    link: '#',
                    pubDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Dot News'
                },
                {
                    title: 'Regulação Cripto: G20 estabelece padrões globais para stablecoins',
                    link: '#',
                    pubDate: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
                    author: 'Reuters'
                },
                {
                    title: 'Chainlink integra sistemas de pagamento Swift para ativos tokenizados',
                    link: '#',
                    pubDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Blockchain Insider'
                },
                {
                    title: 'Nvidia lança chips otimizados para mineração sustentável de ZK-Proofs',
                    link: '#',
                    pubDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Hardware Zone'
                },
                {
                    title: 'Adoção de Lightning Network cresce 300% em pagamentos no varejo',
                    link: '#',
                    pubDate: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Crypto Economy'
                },
                {
                    title: 'Hacker devolve $40 milhões após falha em protocolo DeFi',
                    link: '#',
                    pubDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Security Watch'
                },
                {
                    title: 'Cardano finaliza transição para governança 100% on-chain',
                    link: '#',
                    pubDate: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Cardano Feed'
                },
                {
                    title: 'Tokens de Real World Assets (RWA) atingem capitalização recorde',
                    link: '#',
                    pubDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
                    author: 'Forbes'
                }
            ]
        };
    }
}