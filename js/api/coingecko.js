const BASE_URL = ' https://api.coingecko.com/api/v3';
export async function getTopCoins() {
    const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&price_change_percentage=24h,7d`
    );
    console.log(response.status);
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
    return [...data].filter(coins => coins.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 7);

}

export async function topLosers() {

    const idsLow = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h`);
    const data = await idsLow.json();
    return [...data].filter(coins => coins.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 7);

}

export async function overviewMarket() {
    const response = await fetch(
        `${BASE_URL}/global`
    );
    const data = await response.json();
    return data.data;
}

export async function marketNews() {
    return [
        {
            title: 'Bitcoin mantem consolidação acima de $30.000',
            link: '#',
            date: new Date().toISOString(),
            source: 'Crypto News'
        },
        {
            title: 'Ethereum 2.0: O que esperar da atualização',
            link: '#',
            date: new Date().toISOString(),
            source: 'Blockchain Today'
        },
        {
            title: 'Altcoins ganham força no mercado em alta',
            link: '#',
            date: new Date().toISOString(),
            source: 'Altcoin Daily'
        },
        {
            title: 'Análise técnica: Principais níveis de suporte e resistência',
            link: '#',
            date: new Date().toISOString(),
            source: 'Crypto Analysis'
        },
        {
            title: 'Regulamentação cripto: Impactos no mercado global',
            link: '#',
            date: new Date().toISOString(),
            source: 'Finance Today'
        },
        {
            title: 'NFTs continuam a revolucionar o mercado digital',
            link: '#',
            date: new Date().toISOString(),
            source: 'Digital Art News'
        },
        {
            title: 'DeFi: O futuro das finanças descentralizadas',
            link: '#',
            date: new Date().toISOString(),
            source: 'DeFi Weekly'
        },
        {
            title: 'Ethereum 3.0: Comunidade aprova nova fase de escalabilidade para março',
            link: '#',
            date: new Date().toISOString(),
            source: 'Tech Radar'
        },
        {
            title: 'Solana ultrapassa volume diário do Ethereum em mercados NFT',
            link: '#',
            date: new Date().toISOString(),
            source: 'Solana Daily'
        },
        {
            title: 'Banco Central do Brasil anuncia novos testes com contratos inteligentes no DREX',
            link: '#',
            date: new Date().toISOString(),
            source: 'Valor Econômico'
        },
        {
            title: 'Bitcoin rompe resistência histórica e busca novos alvos em $125.000',
            link: '#',
            date: new Date().toISOString(),
            source: 'Crypto News'
        },
        {
            title: 'Ethereum registra queda nas taxas de gás após implementação de novo EIP',
            link: '#',
            date: new Date().toISOString(),
            source: 'Ether World'
        },
        {
            title: 'Solana lança Saga Phone 3 com foco em IA e pagamentos nativos',
            link: '#',
            date: new Date().toISOString(),
            source: 'Solana Daily'
        },
        {
            title: 'Ripple (XRP) vence última etapa judicial e expande operações na Ásia',
            link: '#',
            date: new Date().toISOString(),
            source: 'Finance Magnates'
        },
        {
            title: 'CVM brasileira aprova novo ETF focado em Real World Assets (RWA)',
            link: '#',
            date: new Date().toISOString(),
            source: 'Valor Econômico'
        },
        // --------------//
        {
            title: 'Regulação Cripto: G20 estabelece padrões globais para stablecoins',
            link: '#',
            date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Reuters'
        },
        {
            title: 'Chainlink integra sistemas de pagamento Swift para ativos tokenizados',
            link: '#',
            date: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
            source: 'Blockchain Insider'
        },
        {
            title: 'Nvidia lança chips otimizados para mineração sustentável de ZK-Proofs',
            link: '#',
            date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Hardware Zone'
        },
        {
            title: 'Adoção de Lightning Network cresce 300% em pagamentos de varejo na América Latina',
            link: '#',
            date: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Crypto Economy'
        },
        {
            title: 'Hacker devolve $40 milhões após falha em protocolo de empréstimo DeFi',
            link: '#',
            date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Security Watch'
        },
        {
            title: 'Cardano finaliza transição para governança 100% on-chain',
            link: '#',
            date: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Cardano Feed'
        },
        {
            title: 'Tokens de Real World Assets (RWA) atingem capitalização recorde',
            link: '#',
            date: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
            source: 'Forbes'
        },
        {
            title: 'Polkadot 2.0: Nova arquitetura de leilões reduz custos para desenvolvedores',
            link: '#',
            date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Dot News'
        },
        {
            title: 'Regulação Cripto: G20 estabelece padrões globais para stablecoins',
            link: '#',
            date: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
            source: 'Reuters'
        },
        {
            title: 'Chainlink integra sistemas de pagamento Swift para ativos tokenizados',
            link: '#',
            date: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Blockchain Insider'
        },
        {
            title: 'Nvidia lança chips otimizados para mineração sustentável de ZK-Proofs',
            link: '#',
            date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Hardware Zone'
        },
        {
            title: 'Adoção de Lightning Network cresce 300% em pagamentos no varejo',
            link: '#',
            date: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Crypto Economy'
        },
        {
            title: 'Hacker devolve $40 milhões após falha em protocolo DeFi',
            link: '#',
            date: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Security Watch'
        },
        {
            title: 'Cardano finaliza transição para governança 100% on-chain',
            link: '#',
            date: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Cardano Feed'
        },
        {
            title: 'Tokens de Real World Assets (RWA) atingem capitalização recorde',
            link: '#',
            date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
            source: 'Forbes'
        }
    ]

}