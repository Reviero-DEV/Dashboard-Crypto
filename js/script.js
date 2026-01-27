import { getTopCoins, getCoinChart } from './api/coingecko.js';

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

let cryptoChart = null;

async function renderChart(coinId, days = 30) {
  const canvas = document.getElementById('coinChart');
  if (!canvas) return;

  try {
    const chartData = await getCoinChart(coinId, days);
    const labels = chartData.prices.map(price => {
      const date = new Date(price[0]);
      return date.toLocaleDateString();
    });
    const dataPoints = chartData.prices.map(price => price[1]);

    if (cryptoChart) {
      cryptoChart.destroy();
    }

    cryptoChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Preço em USD',
          data: dataPoints,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Data'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Preço (USD)'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro ao renderizar gráfico', error.message);
  }
  console.log(window.Chart)
}
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  renderChart('bitcoin', 30);
});