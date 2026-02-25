import { getTopCoins, getCoinChart, getCardHighlights, topGainers, overviewMarket, marketNews } from './api/coingecko.js';

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

let cacheCoins = {};

async function savedCoinsCache(currency) {
  try {
    if (!cacheCoins[currency]) {
      cacheCoins[currency] = await getTopCoins(currency);
    }
    return cacheCoins[currency];
  } catch (error) {
    console.error('Erro ao carregar moedas', error.message);
  }
}


async function carregarDashboard(coinId = appState.coin, currency = appState.currency) {
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
    const coins = await savedCoinsCache(currency);
    const coin = coins.find(c => c.id === coinId);
    if (!coin) throw new Error('Nao encontrado');

    nameEl.textContent = coin.name;
    priceEl.textContent = coin.current_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    });
    percentChangeEl.textContent = `${coin.price_change_percentage_7d_in_currency.toFixed(2)}%`;
    percentChangeEl.className = coin.price_change_percentage_7d_in_currency >= 0 ? 'change-positive' : 'change-negative';
    percentChange24hEl.textContent = `${coin.price_change_percentage_24h.toFixed(2)}%`;
    percentChange24hEl.className = coin.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative';

    highLowEl.textContent = `${formatNumberCompact(coin.high_24h).toLocaleString('pt-BR', {
      style: 'currency', currency: currency.toUpperCase()
    })} / ${formatNumberCompact(coin.low_24h).toLocaleString('pt-BR', { style: 'currency', currency: currency.toUpperCase() })}`;

    volumeEl.textContent = formatNumberCompact(coin.total_volume);

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

async function renderChart(coinId = appState.coin, days = appState.days, currency = appState.currency) {
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
  // console.log(window.Chart)
}

async function renderCardHighlights() {
  const coins = await getCardHighlights();
  const listContainer = document.getElementById('highlights-list');

  listContainer.innerHTML = coins.map(coin => `
        <li class="highlight-item coin-select" data-id="${coin.id}">
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

  listContainer.addEventListener('click', (e) => {
    const li = e.target.closest('.coin-select');
    if (!li) return;
    const coinIdH = li.dataset.id;
    carregarDashboard(appState.coin = coinIdH);
    renderChart(appState.coin = coinIdH, appState.days, appState.currency);
  });
}

async function renderTopMovers() {
  const data =  await topGainers();
  const gainers = [...data].filter(coins => coins.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 7);
  
  const losers = [...data].filter(coins => coins.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 7);

  const gainersContainer = document.getElementById('top-gainers');
  const losersContainer = document.getElementById('top-losers');

  gainersContainer.innerHTML = gainers.map(coin => `
    <li class="top-mover-item highlight-item coin-select" data-id="${coin.id}">
      <div class="top-mover-content">
        <img src="${coin.image}" width="20" class="me-2" alt="${coin.name}">
        <span>${coin.name}</span>
      </div>
      <div class="top-mover-info">
        <small class="change-positive">${coin.price_change_percentage_24h.toFixed(2)}%</small>
      </div>
    </li>
  `).join('');

  gainersContainer.addEventListener('click', (e) => {
    const li = e.target.closest('.coin-select');
    const coinIdHigh = li.dataset.id;
    carregarDashboard(appState.coin = coinIdHigh);
    renderChart(appState.coin = coinIdHigh, appState.days, appState.currency);
  });

  losersContainer.innerHTML = losers.map(coin => `
    <li class="top-mover-item highlight-item coin-select" data-id="${coin.id}">
      <div class="top-mover-content">
        <img src="${coin.image}" width="20" class="me-2" alt="${coin.name}">
        <span>${coin.name}</span>
      </div>
      <div class="top-mover-info">
        <small class="change-negative">${coin.price_change_percentage_24h.toFixed(2)}%</small>
      </div>
    </li>
  `).join('');

  losersContainer.addEventListener('click', (e) => {
    const li = e.target.closest('.coin-select');
    const coinIdLow = li.dataset.id;
    carregarDashboard(appState.coin = coinIdLow);
    renderChart(appState.coin = coinIdLow, appState.days, appState.currency);
  });
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

function createNewsItem(item) {
  return `
    <li class="news-item">
    <a href="${item.link}" class="news-link">
    <p class="news-title">${item.title}</p>
    <span class="news-meta">
    ${item.author} - ${new Date(item.pubDate).toLocaleDateString('pt-BR')}
    </span>
    </a>
    </li>
  `;
}

async function renderNews() {
  const highlightsNews = document.getElementById('news-list');
  const newsToday = document.getElementById('latest-news');
  const newsLatest = document.getElementById('news-week');

  if (!highlightsNews || !newsToday || !newsLatest) return;
  highlightsNews.textContent = 'Carregando notícias...';
  newsToday.textContent = 'Carregando notícias...';
  newsLatest.textContent = 'Carregando notícias...';

  const news = await marketNews();

  const hoje = new Date().toISOString().split('T')[0];
  const noticiasHoje = news.filter(n => n.pubDate.startsWith(hoje));
  const noticiasSemana = news.filter(n => !n.pubDate.startsWith(hoje));
  highlightsNews.innerHTML = news.slice(0, 10).map(createNewsItem).join('');
  newsToday.innerHTML = noticiasHoje.slice(0, 10).map(createNewsItem).join('');
  newsLatest.innerHTML = noticiasSemana.slice(0, 10).map(createNewsItem).join('');
  console.log(`temos ${noticiasHoje.length} noticias de hoje`);
  console.log(`temos ${noticiasSemana.length} noticias da semana`);
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
    carregarDashboard(coinId);
    renderChart(coinId, appState.days, appState.currency);
    searchResults.innerHTML = '';
    searchInput.value = '';
  });
}

async function searchCoins(query) {
  return savedCoinsCache().then(coins =>
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
  appState.days = periodMap[selDate.value] || 30;
  renderChart(appState.coin, appState.days);
}

document.getElementById('filter-date').addEventListener('change', () => {
  loadFilterData();
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
  carregarDashboard(appState.coin, appState.currency);
  renderChart(appState.coin, appState.days, appState.currency);
}

document.querySelector('.select-mda').addEventListener('change', () => {
  loadFilterCurrency();
});


document.getElementById('toggleAside').addEventListener('click', () => {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
});

function showView(viewId, button) {
  const views = document.querySelectorAll('main > section');
  const buttons = document.querySelectorAll('.sidebar button');
  views.forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active-view');
  });

  buttons.forEach(btn => btn.classList.remove('active-btn'));
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.remove('hidden');
    activeView.classList.add('active-view');
  }
  button.classList.add('active-btn');
}

document.querySelectorAll('.sidebar button[data-view]')
  .forEach(button => {
    button.addEventListener('click', function () {
      const viewId = this.dataset.view;
      showView(viewId, this);
    });
  });

window.addEventListener('DOMContentLoaded', () => {
  const firstButton = document.querySelector('.sidebar button[data-view="home-view"]');
  if (firstButton) {
    firstButton.classList.add('active-btn');
  }
});

document.getElementById('btnCompare').addEventListener('click', () => {
renderChartCompare(coinA, coinB, appState.days, appState.currency);
})

function searchCompare(inputId, resultsId, loadCoinData) {
  const input = document.getElementById(inputId);
  const resultsCont = document.getElementById(resultsId);

  let debounceTimerComp;

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimerComp);
    debounceTimerComp = setTimeout(async () => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        resultsCont.innerHTML = '';
        resultsCont.style.display = 'none';
        return;
      }

      const results = await searchCoins(query);
      const topResults = results.slice(0, 8);
      resultsCont.innerHTML = topResults.map(coin => `
        <li class="search-result-item" data-id="${coin.id}">
          <img src="${coin.image}" width="20" class="me-2" />
          <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
        </li>
      `).join('');
    }, 100);


    resultsCont.style.display = input.value.length > 0 ? 'flex' : 'none';
  });
  resultsCont.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const coinId = item.dataset.id;
    loadCoinData(coinId);
    resultsCont.innerHTML = '';
    resultsCont.style.display = 'none';
    input.value = coinId;
  });
}

document.getElementById('compareBtn').addEventListener('click', (e) => {
e.disabled = !coinA || !coinB || coinA === coinB;
  if(!coinA || !coinB) {
    alert('Selecione duas moedas');
    return;
  }
  if(coinA === coinB) {
    alert('Escolha moedas diferentes');
    return;
  }
renderChartCompare(coinA, coinB, appState.days, appState.currency);
})

let compareChart = null;
let coinA = 'bitcoin';
let coinB = 'ethereum';

function formatPercentage(prices) {
  const base = prices[0];
  return prices.map(price => ((price - base) / base) * 100);

}

async function renderChartCompare(coinA, coinB, days = 30, currency = 'usd') {
  const canvasCompare = document.getElementById('compareChart');
  if (!canvasCompare) return;
  canvasCompare.textContent = 'Carregando...';
  try {
    const chartDataA = await getCoinChart(coinA, days, currency);
    const chartDataB = await getCoinChart(coinB, days, currency);

    const labelsA = chartDataA.prices.map(price => {
      const date = new Date(price[0]);
      return date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
    });

    const labelsB = chartDataB.prices.map(price => {
      const date = new Date(price[0]);
      return date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
    });
    const pricesA = chartDataA.prices.map(p => p[1]);
    const pricesB = chartDataB.prices.map(p => p[1]);
    const dataPointsA = formatPercentage(pricesA);
    const dataPointsB = formatPercentage(pricesB);

    if (compareChart) {
      compareChart.destroy();
    }

    compareChart = new Chart(canvasCompare.getContext('2d'), {
      type: 'line',
      data: {
        labels: labelsA, labelsB,
        datasets: [{
          label: `${coinA} Variaçao %`,
          data: dataPointsA,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }, {
          label: `${coinB} Variaçao %`,
          data: dataPointsB,
          borderColor: 'rgb(130, 177, 44)',
          tension: 0.4,
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },]
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
    console.error('Erro ao renderizar gráfico de comparacao:', error.message);
  }
}

async function renderDetailsCompare(coinId, prefix, days = 30, currency = 'usd') {
  const nameEl = document.getElementById(`name-${prefix}`);
  const priceEl = document.getElementById(`price-${prefix}`);
  const percentChangeEl = document.getElementById(`percentChange-${prefix}`);
  const percentChange24hEl = document.getElementById(`percentChange24h-${prefix}`);
  const highLowEl = document.getElementById(`highLow-${prefix}`);
  const volumeEl = document.getElementById(`volume-${prefix}`);

  try {
    const data = await savedCoinsCache();
    const coin = data.find(d => d.id === coinId);

    nameEl.textContent = coin.name;
    priceEl.textContent = `${coin.current_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    })}`;
    percentChangeEl.textContent = `${coin.price_change_percentage_7d_in_currency.toFixed(2)}%`;
    percentChangeEl.className = coin.price_change_percentage_7d_in_currency >= 0 ? 'change-positive' : 'change-negative';
    percentChange24hEl.textContent = `${coin.price_change_percentage_24h.toFixed(2)}%`;
    percentChange24hEl.className = coin.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative';
    highLowEl.textContent = `${coin.high_24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / $${coin.low_24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    volumeEl.textContent = `${formatNumberCompact(coin.total_volume)}`;

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

document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  renderChart();
  renderCardHighlights();
  renderTopMovers();
  renderMarketOverview();
  renderNews();
  
  renderDetailsCompare(coinA, 'coinA', appState.days, appState.currency);
  renderDetailsCompare(coinB, 'coinB', appState.days, appState.currency);
  searchCompare('coinAInput', 'searchResults-coinA', (coinId) => {
    coinA = coinId;
    renderDetailsCompare(coinA, 'coinA');
  });
  searchCompare('coinBInput', 'searchResults-coinB', (coinId) => {
    coinB = coinId;
    renderDetailsCompare(coinB, 'coinB');
  });
});