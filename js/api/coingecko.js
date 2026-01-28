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