import { getTopCoins, getCoinChart, getCardHighlights, topGainers, topLosers, overviewMarket, marketNews } from './api/coingecko.js';

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

const appState = {
  coin: 'bitcoin',
  days: 30,
  currency: 'usd'
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

async function renderChart(coinId, days = 30, currency = 'usd') {
  const canvas = document.getElementById('coinChart');
  if (!canvas) return;

  try {
    const chartData = await getCoinChart(coinId, days, currency);
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
          label: `Preço em ${appState.currency.toUpperCase()}`,
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
  // console.log(listContainer);
}

async function renderTopMovers() {
  const gainers = await topGainers();
  const losers = await topLosers();

  const gainersContainer = document.getElementById('top-gainers');
  const losersContainer = document.getElementById('top-losers');

  gainersContainer.innerHTML = gainers.map(coin => `
    <li class="top-mover-item highlight-item">
      <div class="top-mover-content">
        <img src="${coin.image}" width="20" class="me-2" alt="${coin.name}">
        <span>${coin.name}</span>
      </div>
      <div class="top-mover-info">
        <small class="change-positive">${coin.price_change_percentage_24h.toFixed(2)}%</small>
      </div>
    </li>
  `).join('');

  // console.log(topGainers)

  losersContainer.innerHTML = losers.map(coin => `
    <li class="top-mover-item highlight-item">
      <div class="top-mover-content">
        <img src="${coin.image}" width="20" class="me-2" alt="${coin.name}">
        <span>${coin.name}</span>
      </div>
      <div class="top-mover-info">
        <small class="change-negative">${coin.price_change_percentage_24h.toFixed(2)}%</small>
      </div>
    </li>
  `).join('');
}

async function renderMarketOverview() {
  const priceGlobalEl = document.getElementById('marketGlobalPrice');
  const percentGlobalEl = document.getElementById('marketCapChange');
  const volumeGlobal24hEl = document.getElementById('globalVolume24h');
  const btcDominanceEl = document.getElementById('btcDominance');
  const activeCryptosEl = document.getElementById('activeCryptos');

  if (!priceGlobalEl || !percentGlobalEl || !volumeGlobal24hEl || !btcDominanceEl || !activeCryptosEl) return;
  priceGlobalEl.textContent = 'carregando...';
  percentGlobalEl.textContent = '--';
  volumeGlobal24hEl.textContent = '--';
  btcDominanceEl.textContent = '--';
  activeCryptosEl.textContent = '--';

  try {
    const data = await overviewMarket();

    priceGlobalEl.textContent = formatNumberCompact(data.total_market_cap.usd);
    percentGlobalEl.textContent = `${data.market_cap_change_percentage_24h_usd.toFixed(2)}%`;
    percentGlobalEl.className = data.market_cap_change_percentage_24h_usd >= 0 ? 'change-positive' : 'change-negative';
    volumeGlobal24hEl.textContent = formatNumberCompact(data.total_volume.usd);
    btcDominanceEl.textContent = `${data.market_cap_percentage.btc.toFixed(2)}%`;
    activeCryptosEl.textContent = formatNumberCompact(data.active_cryptocurrencies);
  } catch (error) {
    console.error('Erro ao carregar dashboard', error.message);
    priceGlobalEl.textContent = '--';
    percentGlobalEl.textContent = '--';
    volumeGlobal24hEl.textContent = '--';
    btcDominanceEl.textContent = '--';
    activeCryptosEl.textContent = '--';
  }
}

async function renderNews() {
  const listNews = document.getElementById('news-list');
  if (!listNews) return;
  listNews.textContent = 'Carregando notícias...';
  const news = await marketNews();
  listNews.innerHTML = news.map(item => `
    <li class="news-item">
    <a href="${item.link}" class="news-link">
    <p class="news-title">${item.title}</p>
    <span class="news-meta">
    ${item.source} - ${new Date(item.date).toLocaleDateString('pt-BR')}
    </span>
    </a>
    </li>
  `).join('');

}

function initSearch() {
  const searchInput = document.getElementById('inputSearch');
  const searchResults = document.getElementById('searchResults');
  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
      }

      const results = await searchCoins(query);

      const topResults = results.slice(0, 8);
      searchResults.innerHTML = topResults.map(coin => `
        <li class="search-result-item" data-id="${coin.id}">
          <img src="${coin.image}" width="20" class="me-2" />
          <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
        </li>
      `).join('');
    }, 300);
    searchResults.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
  });
  searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const coinId = item.dataset.id;
    loadCoinData(coinId);
    searchResults.innerHTML = '';
    searchInput.value = '';
  });
}

async function searchCoins(query) {
  return getTopCoins().then(coins =>
    coins.filter(coin =>
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    )
  );
}

initSearch();

let currentCoin = 'bitcoin';

async function loadFilterData() {
  const selDate = document.getElementById('filter-date');
  if (!selDate) return;
  const periodMap = {
    'ult-7d': 7,
    'ult-3od': 30,
    'ult-3m': 90,
    'ult-1y': 365,
    'all-time': 'max'
  }
 appState.days = periodMap[selDate.value]  || 30;
  console.log('Carregando dados para o período:', selDate.value, appState.days);
  console.log(renderChart(currentCoin, appState.days))
  renderChart(appState.coin, appState.days, appState.currency);
  
}

document.getElementById('filter-date').addEventListener('change', () => {
  console.log('carregando filtro');
  loadFilterData();
  console.log('filtro carregado');
});

async function loadFilterCurrency() {
  const selCurrency = document.querySelector('.select-mda');
  if (!selCurrency) return;

  const currencyMap = {
    'USD': 'usd',
    'EUR': 'eur',
    'BRL': 'brl'
  }
  appState.currency = currencyMap[selCurrency.value] || 'usd';
  console.log('Carregando dados para a moeda:', selCurrency.value, appState.currency);
  renderChart(appState.coin, appState.days, appState.currency);
  }

document.querySelector('.select-mda').addEventListener('change', () => {
  console.log('carregando filtro de moeda');
  loadFilterCurrency();
  console.log('filtro de moeda carregado');
});


document.getElementById('toggleAside').addEventListener('click', () => {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
});

document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  renderChart('bitcoin', 30);
  renderCardHighlights();
  renderTopMovers();
  renderMarketOverview();
  renderNews()
});