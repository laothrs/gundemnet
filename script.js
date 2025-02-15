const newsContainer = document.getElementById('newsContainer');
const featuredNews = document.getElementById('featuredNews');
const API_TOKEN = '4OP23GTfzxgOj3E6mJBtNv:0kUH0Ed7cCjzKSRACTX7bb';

// Özel haberler
const customArticles = [
    {
        name: "Silah Kartelinin İntikamı: Polis Memuru Otoparkta Kurşun Yağmuruna Tutuldu!",
        description: "İstanbul'da 3 Ocak'ta gerçekleşen ve ülke genelinde geniş yankı uyandıran olay, organize suç örgütlerinin ne denli tehlikeli olduğunu bir kez daha ortaya koydu.",
        fullDescription: `İstanbul'da 3 Ocak'ta gerçekleşen ve ülke genelinde geniş yankı uyandıran olay, organize suç örgütlerinin ne denli tehlikeli olduğunu bir kez daha ortaya koydu. Güvenlik güçleri tarafından gerçekleştirilen başarılı bir operasyon sonucunda, silah karteli lideri M.E.'nin oğlu A.E. gözaltına alındı. Bu gelişme, suçla mücadelede önemli bir adım olarak değerlendirildi. Ancak, operasyonun yankıları uzun sürmeden, trajik bir haber gündeme düştü.

A.E.'yi gözaltına alan polis memurunun, olaydan birkaç gün sonra bir otoparkta pusuya düşürülerek infaz edildiği haberi, tüm ülkede infial yarattı. Güvenlik güçlerinin aktardığı bilgilere göre, polis memuru, saldırganlar tarafından tam 50 kurşunla hedef alınmıştı. Bu vahşet, saldırının profesyonelce ve organize bir şekilde gerçekleştirildiğini gözler önüne serdi.

Olayın ardından yetkililer, saldırının M.E. liderliğindeki kartelin intikam amaçlı bir eylemi olduğunu değerlendirdi. Kamuoyunda korku ve öfke yaratan bu saldırı, güvenlik güçleri arasında da derin bir moral çöküntüsüne yol açtı. Özellikle bu tür saldırılar, organize suç örgütlerinin yalnızca bireyleri değil, aynı zamanda devlet otoritesini hedef aldığını da gözler önüne seriyor.

Uzmanlara göre, karteller yalnızca yasadışı ticaretle değil, aynı zamanda toplumda korku salarak kamu düzenini sarsmayı amaçlıyor. İstanbul gibi metropol bir şehirde bu tür örgütlerle mücadele, güçlü bir strateji ve uluslararası işbirliği gerektiriyor. Bu olay, güvenlik güçlerinin ne denli büyük bir risk altında olduğunu ve toplumun huzurunu sağlamak için verdikleri mücadeleyi bir kez daha acı bir şekilde hatırlattı.

Şimdi tüm gözler, bu hain saldırıyı gerçekleştiren faillerin yakalanıp adalet önüne çıkarılmasında. Adaletin sağlanması, hem toplumun vicdanında hem de güvenlik güçlerinin moralinde büyük bir önem taşıyor.`,
        image: "ae.jpeg",
        source: "NetGündem",
        date: "2024-01-06T16:34:00",
        category: "gündem"
    }
];

// Haberleri localStorage'dan al veya boş array oluştur
let savedNews = JSON.parse(localStorage.getItem('allNews')) || [];
const lastUpdateDate = localStorage.getItem('lastUpdateDate');
const today = new Date().toDateString();

// Kategori bazlı haber filtreleme sistemi
const categories = {
    'ana-sayfa': 'general',
    'son-dakika': 'breaking',
    'gundem': 'general',
    'ekonomi': 'economy',
    'spor': 'sport',
    'dunya': 'world',
    'teknoloji': 'technology'
};

// Aktif kategoriyi takip etmek için
let activeCategory = 'ana-sayfa';

async function getNews() {
    try {
        const response = await fetch('https://api.collectapi.com/news/getNews?country=tr&tag=general', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': `apikey ${API_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Özel haberleri API haberlerinin başına ekle
            const allNews = [...customArticles, ...data.result];
            
            // Haberleri localStorage'a kaydet
            localStorage.setItem('allNews', JSON.stringify(allNews));
            
            // Haberleri göster
            const headline = customArticles[0]; // En son eklenen özel haber manşette
            const subHeadlines = allNews.slice(1, 5);
            const otherNews = allNews.slice(5);
            
            displayHeadline(headline);
            displaySubHeadlines(subHeadlines);
            displayNews(otherNews);
        }
    } catch (error) {
        console.error('Haberler yüklenirken hata oluştu:', error);
        
        // Hata durumunda sadece özel haberleri göster
        const allNews = [...customArticles];
        localStorage.setItem('allNews', JSON.stringify(allNews));
        displayHeadline(customArticles[0]);
        displaySubHeadlines(customArticles.slice(1));
        displayNews([]);
    }
}

// Hava durumu fonksiyonu
async function getWeather() {
    try {
        const response = await fetch('https://api.collectapi.com/weather/getWeather?data.lang=tr&data.city=istanbul', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': `apikey ${API_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateWeatherWidget(data.result[0]);
        }
    } catch (error) {
        console.error('Hava durumu bilgisi alınamadı:', error);
    }
}

function updateWeatherWidget(weather) {
    const weatherWidget = document.getElementById('weather');
    const headerWeather = document.getElementById('currentTemp');
    
    // Header'daki hava durumu
    headerWeather.textContent = `${weather.degree}°C`;
    
    // Sidebar'daki detaylı hava durumu
    weatherWidget.innerHTML = `
        <div class="current-weather">
            <span class="temp">${weather.degree}°C</span>
            <span class="condition">${weather.description}</span>
            <div class="weather-details">
                <div>Nem: ${weather.humidity}%</div>
                <div>Rüzgar: ${weather.wind} km/s</div>
            </div>
        </div>
    `;
}

function displayHeadline(news) {
    const headlineSection = document.getElementById('featuredNews');
    if (!headlineSection) return;
    
    const isCustomNews = news.source === 'NetGündem';
    const url = isCustomNews ? `news-detail.html#${slugify(news.name)}` : news.url;
    
    headlineSection.innerHTML = `
        <div class="headline-card" onclick="window.location.href='${url}'">
            <div class="headline-image">
                <img src="${news.image}" alt="${news.name}" loading="lazy">
            </div>
            <div class="headline-content">
                <h2>${news.name}</h2>
                <p>${news.description}</p>
                <div class="news-meta">
                    <span class="news-source">${news.source}</span>
                    <span class="news-date">${formatDate(news.date)}</span>
                </div>
            </div>
        </div>
    `;
}

function displaySubHeadlines(newsList) {
    const subHeadlinesSection = document.getElementById('subHeadlines');
    if (!subHeadlinesSection) return;
    
    subHeadlinesSection.innerHTML = newsList.map(news => {
        const isCustomNews = news.source === 'NetGündem';
        const url = isCustomNews ? `news-detail.html#${slugify(news.name)}` : news.url;
        
        return `
            <div class="sub-headline-card" onclick="window.location.href='${url}'">
                <div class="sub-headline-image">
                    <img src="${news.image}" alt="${news.name}" loading="lazy">
                </div>
                <div class="sub-headline-content">
                    <h3>${news.name}</h3>
                    <p>${news.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${news.source}</span>
                        <span class="news-date">${formatDate(news.date)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayNews(newsList) {
    const newsSection = document.getElementById('newsContainer');
    if (!newsSection) return;
    
    newsSection.innerHTML = newsList.map(news => {
        const isCustomNews = news.source === 'NetGündem';
        const url = isCustomNews ? `news-detail.html#${slugify(news.name)}` : news.url;
        
        return `
            <div class="news-card" onclick="window.location.href='${url}'">
                <div class="news-card-image">
                    <img src="${news.image}" alt="${news.name}" loading="lazy">
                </div>
                <div class="news-card-content">
                    <h3>${news.name}</h3>
                    <p>${news.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${news.source}</span>
                        <span class="news-date">${formatDate(news.date)}</span>
                        <span class="news-detail-link">${isCustomNews ? 'Detayları Görüntüle' : 'Kaynağa Git'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Arama fonksiyonelliği
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.cssText = `
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin-top: 5px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
    `;
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(searchResults);

    // Arama sonuçlarını göster/gizle
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            searchResults.style.display = 'block';
        }
    });

    // Dışarı tıklandığında sonuçları gizle
    document.addEventListener('click', (e) => {
        if (!searchInput.parentElement.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Arama işlemi
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        const allNews = JSON.parse(localStorage.getItem('allNews')) || [];
        const results = allNews.filter(news => 
            news.name.toLowerCase().includes(query) || 
            news.description.toLowerCase().includes(query)
        ).slice(0, 5);

        if (results.length > 0) {
            searchResults.innerHTML = results.map(news => `
                <div class="search-result-item" onclick="window.location.href='news-detail.html#${news.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}'">
                    <div class="search-result-image">
                        <img src="${news.imageData || news.image}" alt="${news.name}">
                    </div>
                    <div class="search-result-content">
                        <h4>${highlightText(news.name, query)}</h4>
                        <p>${highlightText(truncateText(news.description, 100), query)}</p>
                        <span class="search-result-date">${new Date(news.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>
            `).join('');
            searchResults.style.display = 'block';

            // Arama sonuçları için stil ekle
            const style = document.createElement('style');
            style.textContent = `
                .search-result-item {
                    display: flex;
                    padding: 1rem;
                    gap: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .search-result-item:hover {
                    background-color: #f5f5f5;
                }
                .search-result-item:not(:last-child) {
                    border-bottom: 1px solid #eee;
                }
                .search-result-image {
                    width: 80px;
                    height: 60px;
                    border-radius: 4px;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .search-result-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .search-result-content {
                    flex: 1;
                }
                .search-result-content h4 {
                    margin: 0 0 0.5rem;
                    font-size: 1rem;
                    color: #333;
                }
                .search-result-content p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #666;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .search-result-date {
                    display: block;
                    font-size: 0.8rem;
                    color: #999;
                    margin-top: 0.5rem;
                }
                .highlight {
                    background-color: #fff3cd;
                    padding: 0 2px;
                    border-radius: 2px;
                }
            `;
            document.head.appendChild(style);
        } else {
            searchResults.innerHTML = `
                <div class="search-result-empty" style="padding: 1rem; text-align: center; color: #666;">
                    Sonuç bulunamadı
                </div>
            `;
            searchResults.style.display = 'block';
        }
    }, 300));
}

// Yardımcı fonksiyonlar
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Döviz kurları fonksiyonu
async function getCurrencyRates() {
    try {
        const response = await fetch('https://api.collectapi.com/economy/currencyToAll?int=10&base=USD', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': `apikey ${API_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateCurrencyWidget(data.result);
        }
    } catch (error) {
        console.error('Döviz kurları alınamadı:', error);
        // Hata durumunda varsayılan değerler göster
        const defaultRates = [
            { calculated: 31.24, change: 0.25, code: 'TRY' },
            { calculated: 0.92, change: -0.15, code: 'EUR' },
            { calculated: 0.79, change: 0.10, code: 'GBP' }
        ];
        updateCurrencyWidget(defaultRates);
    }
}

// Döviz widget'ını güncelle
function updateCurrencyWidget(rates) {
    const currencyWidget = document.getElementById('currency');
    if (!currencyWidget) return;

    const mainCurrencies = ['TRY', 'EUR', 'GBP'];
    const filteredRates = rates.filter(rate => mainCurrencies.includes(rate.code));

    currencyWidget.innerHTML = filteredRates.map(rate => `
        <div class="currency-item">
            <span class="currency-name">USD/${rate.code}</span>
            <span class="currency-value">${rate.code === 'TRY' ? rate.calculated.toFixed(2) + ' ₺' : rate.calculated.toFixed(2)}</span>
            <span class="currency-change ${rate.change >= 0 ? 'up' : 'down'}">
                ${rate.change >= 0 ? '+' : ''}${rate.change}%
            </span>
        </div>
    `).join('');
}

// Navigasyon başlatma
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // URL değişikliğini engelle
            
            // Aktif kategoriyi güncelle
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Kategori içeriğini yükle
            const category = link.getAttribute('data-category') || 'all';
            loadCategoryContent(category);
        });
    });
}

// Kategori içeriğini yükleme
function loadCategoryContent(category) {
    const allNews = JSON.parse(localStorage.getItem('allNews')) || [];
    let filteredNews = allNews;
    
    // Eğer belirli bir kategori seçildiyse, haberleri filtrele
    if (category !== 'all') {
        filteredNews = allNews.filter(news => {
            // Kategori eşleşmesini kontrol et
            const newsCategory = news.category || getCategoryFromTitle(news.name);
            return newsCategory.toLowerCase() === category.toLowerCase();
        });
    }
    
    // Haberleri göster
    if (filteredNews.length > 0) {
        const headline = filteredNews[0];
        const subHeadlines = filteredNews.slice(1, 5);
        const otherNews = filteredNews.slice(5);
        
        displayHeadline(headline);
        displaySubHeadlines(subHeadlines);
        displayNews(otherNews);
    } else {
        // Kategori boşsa varsayılan içeriği göster
        getNews();
    }
}

// Başlıktan kategori tahmin etme
function getCategoryFromTitle(title) {
    const categories = {
        'spor': ['futbol', 'basketbol', 'voleybol', 'maç', 'şampiyon', 'lig', 'transfer'],
        'ekonomi': ['dolar', 'euro', 'borsa', 'ekonomi', 'faiz', 'enflasyon', 'vergi'],
        'teknoloji': ['teknoloji', 'yazılım', 'uygulama', 'telefon', 'bilgisayar', 'yapay zeka'],
        'dünya': ['dünya', 'avrupa', 'amerika', 'asya', 'afrika', 'rusya', 'çin']
    };
    
    title = title.toLowerCase();
    for (let [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => title.includes(keyword))) {
            return category;
        }
    }
    
    return 'gündem'; // Varsayılan kategori
}

// URL'yi SEO dostu formata çeviren fonksiyon
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Boşlukları tire ile değiştir
        .replace(/[ğ]/g, 'g')           // Türkçe karakterleri değiştir
        .replace(/[ü]/g, 'u')
        .replace(/[ş]/g, 's')
        .replace(/[ı]/g, 'i')
        .replace(/[ö]/g, 'o')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9-]/g, '')     // Alfanumerik ve tire dışındaki karakterleri kaldır
        .replace(/-+/g, '-')            // Ardışık tireleri tek tireye dönüştür
        .replace(/^-+/, '')             // Baştaki tireleri kaldır
        .replace(/-+$/, '');            // Sondaki tireleri kaldır
}

// Özel haber sayfası oluşturma
function createNewsPage(news) {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <div class="news-detail">
            <div class="news-detail-header">
                <div class="news-category-badge">${news.source}</div>
                <div class="news-detail-meta">
                    <span class="news-date">${new Date(news.date).toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
            <h1 class="news-detail-title">${news.name}</h1>
            <div class="news-detail-image">
                <img src="${news.imageData || news.image}" alt="${news.name}">
            </div>
            <div class="news-detail-content">
                <p>${news.fullDescription || news.description}</p>
            </div>
            <div class="news-detail-footer">
                <div class="news-share">
                    <button onclick="shareNews('facebook')"><i class="fab fa-facebook"></i> Paylaş</button>
                    <button onclick="shareNews('twitter')"><i class="fab fa-twitter"></i> Tweet</button>
                    <button onclick="shareNews('whatsapp')"><i class="fab fa-whatsapp"></i> Gönder</button>
                </div>
            </div>
        </div>
    `;
}

// Benzer haberler oluşturma fonksiyonu
function generateRelatedNews(currentNews) {
    const savedNews = JSON.parse(localStorage.getItem('allNews')) || [];
    const relatedNews = savedNews
        .filter(news => news !== currentNews)
        .slice(0, 3);

    return relatedNews.map(news => `
        <div class="related-news-card" onclick="window.location.href='${news.url}'">
            <div class="related-news-image">
                <img src="${news.image}" alt="${news.name}">
            </div>
            <div class="related-news-content">
                <h4>${news.name}</h4>
                <span class="related-news-date">${formatDate(news.date)}</span>
            </div>
        </div>
    `).join('');
}

// URL değişikliklerini dinle
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1); // # işaretini kaldır
    
    if (hash) {
        // localStorage'dan haberleri al
        const savedNews = JSON.parse(localStorage.getItem('allNews')) || [];
        
        // URL'ye göre haberi bul
        const news = savedNews.find(n => slugify(n.name) === hash);
        
        if (news) {
            // Eğer özel haber ise detay sayfasını oluştur
            if (news.source === 'NetGündem') {
                createNewsPage(news);
            } else {
                // API haberi ise kaynağa yönlendir
                window.location.href = news.url;
            }
        } else {
            // Haber bulunamazsa ana sayfaya dön
            window.location.href = '/';
        }
    }
});

// Özel haber ekleme fonksiyonunu güncelle
function addCustomNews(customNews) {
    // Mevcut haberleri al
    let savedNews = JSON.parse(localStorage.getItem('allNews')) || [];
    
    // URL oluştur
    const newsUrl = `#${slugify(customNews.name)}`;
    
    // Yeni habere tarih ve URL ekle
    const newsWithDate = {
        ...customNews,
        date: new Date().toISOString(),
        addedDate: new Date().toISOString(),
        source: 'Özel Haber',
        url: newsUrl
    };
    
    // Özel haberi en başa ekle, diğer haberleri koru
    const existingNews = savedNews.filter(news => news.source !== 'Özel Haber');
    savedNews = [newsWithDate, ...existingNews];
    
    // localStorage'a kaydet
    localStorage.setItem('allNews', JSON.stringify(savedNews));
    
    // Haberleri yeniden göster
    const headline = savedNews[0];
    const subHeadlines = savedNews.slice(1, 5);
    const otherNews = savedNews.slice(5);
    
    displayHeadline(headline);
    displaySubHeadlines(subHeadlines);
    displayNews(otherNews);
}

// Örnek kullanım:
// addCustomNews({
//     name: 'Haber Başlığı',
//     description: 'Haber içeriği...',
//     image: 'resim.jpg',
//     url: '#'
// });

// Mobil menü fonksiyonelliği
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.querySelector('.main-nav');
    let isMenuOpen = false;

    mobileMenuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        mainNav.classList.toggle('active');
        mobileMenuBtn.innerHTML = isMenuOpen ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });

    // Menü dışına tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mainNav.contains(e.target) && e.target !== mobileMenuBtn) {
            isMenuOpen = false;
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Menü öğesine tıklandığında menüyü kapat
    mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            isMenuOpen = false;
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// DOM yüklendiğinde search'ü başlat
document.addEventListener('DOMContentLoaded', () => {
    getNews();
    getWeather();
    getCurrencyRates();
    initializeNavigation();
    initializeSearch();
    initializeMobileMenu();
});

// Her 5 dakikada bir döviz kurlarını güncelle
setInterval(getCurrencyRates, 300000);

// Her gün bir kez haberleri kontrol et ve güncelle (24 saat = 86400000 ms)
setInterval(getNews, 86400000);

// Sosyal medya paylaşım fonksiyonları
function shareNews(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.querySelector('.news-detail-title').textContent);
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
            break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Mobil menü fonksiyonları
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.querySelector('.main-nav');

mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
        mainNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    }
});

// AOS başlatma
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });
}); 