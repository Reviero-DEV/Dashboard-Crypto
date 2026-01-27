const BASE_URL = ' https://api.coingecko.com/api/v3';
export async function getTopCoins() {
    const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5`
    );
    console.log(response.status);
    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar dados da API`);
    }
    return response.json();
}