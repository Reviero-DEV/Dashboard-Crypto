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

export async function getCoinChart(coinId, days = 30) {
    const response = await fetch(
        `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
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