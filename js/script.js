import { getTopCoins } from './api/coingecko.js';

async function carregarDashboard() {
  const nameEl = document.getElementById('coin-name');
  const priceEl = document.getElementById('coin-price');
  if (!nameEl || !priceEl) return;
  nameEl.textContent = 'Carregando...';
  priceEl.textContent = '--';
  try {
    const coins = await getTopCoins();
    if (!coins || coins.length === 0) {
      throw new Error('Lista vazia');
    }
    const btc = coins[0];
    nameEl.textContent = btc.name;
    priceEl.textContent = btc.current_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD'
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard', error.message);
    nameEl.textContent = 'Dados indisponíveis';
    priceEl.textContent = '--';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
});