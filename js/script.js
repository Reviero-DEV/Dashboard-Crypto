import { getTopCoins, getCoinChart, getCardHighlights, getTrending } from './api/coingecko.js';

function formatNumberCompact(value) {
  if (value == null) return '--';
  const absValue = Math.abs(value);
  if (absValue >= 1e12) {
    return (value / 1e12).toFixed(2) + 'Tri';
  } else if (absValue >= 1e9) {
    return (value / 1e9).toFixed(2) + 'Bi';
  } else if (absValue >= 1e6) {
    return (value / 1e6).toFixed(2) + 'Mi';
  } else if (absValue >= 1e3) {
    return (value / 1e3).toFixed(2) + 'mil';
  } else {
    return `$${value.toFixed(2)}`;
  }
}

async function carregarDashboard() {
  const nameEl = document.getElementById('coin-name');
  const priceEl = document.getElementById('coin-price');
  const percentChangeEl = document.getElementById('percentChange');
  const percentChange24hEl = document.getElementById('percentChange24h');
  const highLowEl = document.getElementById('highLow');
  const volumeEl = document.getElementById('volume');

  if (!nameEl || !priceEl || !percentChangeEl || !percentChange24hEl || !highLowEl || !volumeEl) return;
  nameEl.textContent = 'Carregando...';
  priceEl.textContent = '--';
  percentChangeEl.textContent = '--';
  percentChange24hEl.textContent = '--';
  highLowEl.textContent = '--';
  volumeEl.textContent = '--';

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
    percentChangeEl.textContent = `${btc.price_change_percentage_7d_in_currency.toFixed(2)}%`;
    percentChangeEl.className = btc.price_change_percentage_7d_in_currency >= 0 ? 'change-positive' : 'change-negative';
    percentChange24hEl.textContent = `${btc.price_change_percentage_24h.toFixed(2)}%`;
    percentChange24hEl.className = btc.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative';
    highLowEl.textContent = `$${btc.high_24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / $${btc.low_24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    volumeEl.textContent = formatNumberCompact(btc.total_volume);

  } catch (error) {
    console.error('Erro ao carregar dashboard', error.message);
    nameEl.textContent = 'Dados indisponíveis';
    priceEl.textContent = '--';
    percentChangeEl.textContent = '--';
    percentChange24hEl.textContent = '--';
    highLowEl.textContent = '--';
    volumeEl.textContent = '--';
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
      return date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
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
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 6
            },
            }
          },
          y: {
            ticks: {
              callback: value => `$${(value / 1000).toFixed(2)}k`
            },
            grid: {
              drawBorder: false,
            }
            }
          }
        
      
    });
  } catch (error) {
    console.error('Erro ao renderizar gráfico', error.message);
  }
  console.log(window.Chart)
}

async function renderCardHighlights() {
    const coins = await getCardHighlights();
    const listContainer = document.getElementById('highlights-list');

    listContainer.innerHTML = coins.map(coin => `
        <li class="highlight-item">
            <div class="highlight-item-content">
                <img src="${coin.image}" width="30" class="me-2" alt="${coin.name}">
                <span><strong>${coin.name}</strong> <small class="text-muted">${coin.symbol.toUpperCase()}</small></span>
            </div>
            <div class="highlight-info-content">
                <div>$${coin.current_price.toLocaleString()}</div>
                <small class="${coin.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative'}">
                    ${coin.price_change_percentage_24h.toFixed(2)}%
                </small>
            </div>
        </li>
    `).join('');
    console.log(listContainer);
}


document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  renderChart('bitcoin', 30);
  renderCardHighlights();
});