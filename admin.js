// Admin giriş bilgileri
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'netgundem2024';

// DOM elementleri
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const errorMessage = document.getElementById('errorMessage');
const newsForm = document.getElementById('newsForm');
const imagePreview = document.getElementById('imagePreview');
const newsGrid = document.getElementById('newsGrid');

let editingNews = null; // Düzenlenen haberi takip etmek için

// Sayfa yüklendiğinde oturum kontrolü
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    loadNews();
});

// Giriş durumunu kontrol et
function checkLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        adminPanel.style.display = 'none';
    }
}

// Giriş formu submit olduğunda
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        errorMessage.style.display = 'none';
        checkLogin();
    } else {
        errorMessage.style.display = 'block';
    }
});

// Çıkış işlemi
function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    checkLogin();
}

// Görsel önizleme
document.getElementById('newsImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
});

// Haber formu gönderimi
newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('newsTitle').value;
    const description = document.getElementById('newsDescription').value;
    const newsDate = document.getElementById('newsDate').value;
    const imageFile = document.getElementById('newsImage').files[0];

    if (!editingNews && !imageFile) {
        alert('Lütfen bir görsel seçin!');
        return;
    }

    try {
        let imageBase64 = editingNews ? editingNews.imageData : null;
        
        if (imageFile) {
            imageBase64 = await convertImageToBase64(imageFile);
        }

        const newsData = {
            name: title,
            description: description,
            image: imageFile ? imageFile.name : editingNews ? editingNews.image : '',
            imageData: imageBase64,
            url: 'news-detail.html#' + title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            date: newsDate ? new Date(newsDate).toISOString() : new Date().toISOString(),
            addedDate: new Date().toISOString(),
            source: 'Özel Haber'
        };

        // Mevcut haberleri al
        let allNews = JSON.parse(localStorage.getItem('allNews')) || [];
        
        if (editingNews) {
            // Düzenlenen haberi güncelle
            allNews = allNews.map(news => 
                news.date === editingNews.date ? newsData : news
            );
        } else {
            // Yeni haber ekle
            allNews.unshift(newsData);
        }

        // localStorage'a kaydet
        localStorage.setItem('allNews', JSON.stringify(allNews));

        // Formu temizle ve haberleri yeniden yükle
        resetForm();
        loadNews();

        alert(editingNews ? 'Haber başarıyla güncellendi!' : 'Haber başarıyla eklendi!');
        editingNews = null;

        // Haberi news.js formatına dönüştür ve konsola yazdır
        await addToNewsJs(newsData);

    } catch (error) {
        console.error('Haber işlenirken bir hata oluştu:', error);
        alert('Haber işlenirken bir hata oluştu!');
    }
});

// Formu sıfırla
function resetForm() {
    newsForm.reset();
    imagePreview.innerHTML = '';
    document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-plus"></i>Haberi Ekle';
    editingNews = null;
}

// Görseli base64'e çevirme
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Haberleri yükleme
function loadNews() {
    const allNews = JSON.parse(localStorage.getItem('allNews')) || [];
    const specialNews = allNews.filter(news => news.source === 'Özel Haber');

    newsGrid.innerHTML = '';

    specialNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <div class="news-card-image">
                <img src="${news.imageData || news.image}" alt="${news.name}">
            </div>
            <div class="news-card-content">
                <h4>${news.name}</h4>
                <p class="news-card-date">${new Date(news.date).toLocaleDateString('tr-TR')}</p>
                <div class="news-card-actions">
                    <button class="edit-btn" onclick="editNews('${news.date}')">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="delete-btn" onclick="deleteNews('${news.date}')">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        `;
        newsGrid.appendChild(newsCard);
    });
}

// Haber düzenleme
function editNews(newsDate) {
    const allNews = JSON.parse(localStorage.getItem('allNews')) || [];
    const newsToEdit = allNews.find(news => news.date === newsDate);
    
    if (newsToEdit) {
        editingNews = newsToEdit;
        
        // Form alanlarını doldur
        document.getElementById('newsTitle').value = newsToEdit.name;
        document.getElementById('newsDescription').value = newsToEdit.description;
        
        // Tarihi doldur
        const newsDateInput = document.getElementById('newsDate');
        const date = new Date(newsToEdit.date);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        newsDateInput.value = localDateTime;
        
        // Görsel önizlemeyi göster
        if (newsToEdit.imageData) {
            const img = document.createElement('img');
            img.src = newsToEdit.imageData;
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
        }
        
        // Buton metnini güncelle
        document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-save"></i>Haberi Güncelle';
        
        // Forma kaydır
        newsForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Haber silme
function deleteNews(newsDate) {
    if (confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
        let allNews = JSON.parse(localStorage.getItem('allNews')) || [];
        allNews = allNews.filter(news => news.date !== newsDate);
        localStorage.setItem('allNews', JSON.stringify(allNews));
        loadNews();
        alert('Haber başarıyla silindi!');
    }
}

// Reset butonuna tıklandığında
document.querySelector('.reset-btn').addEventListener('click', () => {
    resetForm();
});

// Haberi news.js formatına dönüştür
function convertToNewsFormat(newsItem) {
    return {
        title: newsItem.name,
        description: newsItem.description,
        date: newsItem.addedDate || new Date().toISOString(),
        image: newsItem.image
    };
}

// Haberi news.js dosyasına ekle
async function addToNewsJs(newsItem) {
    try {
        // Haberi uygun formata dönüştür
        const formattedNews = convertToNewsFormat(newsItem);
        
        // Konsola yazdır
        console.log('News.js için yeni haber formatı:');
        console.log(`{
    title: "${formattedNews.title}",
    description: "${formattedNews.description}",
    date: "${formattedNews.date}",
    image: "${formattedNews.image}",
},`);
        
        alert('Haber başarıyla eklendi! Lütfen konsolu kontrol edin ve görüntülenen formatı news.js dosyasına ekleyin.');
    } catch (error) {
        console.error('Haber dönüştürme hatası:', error);
        alert('Haber dönüştürülürken bir hata oluştu.');
    }
} 