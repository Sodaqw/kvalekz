document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const gallery = document.getElementById('gallery');
    const categorySelect = document.getElementById('category');
    const searchInput = document.getElementById('search');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const sortRatingBtn = document.getElementById('sort-rating');
    const sortDirection = document.getElementById('sort-direction');
    const totalCountSpan = document.getElementById('total-count');
    const avgRatingSpan = document.getElementById('avg-rating');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalRating = document.getElementById('modal-rating');
    const modalUrl = document.getElementById('modal-url');
    
    // Данные приложения
    let images = [];
    let filteredImages = [];
    let categories = [];
    let sortDescending = true;
    
    // Инициализация приложения
    init();
    
    // Функции
    async function init() {
        try {
            await loadImages();
            populateCategories();
            applyFilters();
            setupEventListeners();
        } catch (error) {
            showError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
            console.error('Ошибка загрузки данных:', error);
        }
    }
    
    async function loadImages() {
        const response = await fetch('images.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные');
        }
        images = await response.json();
    }
    
    function populateCategories() {
        categories = [...new Set(images.map(img => img.category))];
        categorySelect.innerHTML = '<option value="">Все категории</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    function applyFilters() {
        const categoryFilter = categorySelect.value;
        const searchQuery = searchInput.value.toLowerCase();
        
        filteredImages = images.filter(img => {
            const matchesCategory = !categoryFilter || img.category === categoryFilter;
            const matchesSearch = !searchQuery || img.title.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });
        
        sortImages();
        updateGallery();
        updateStats();
    }
    
    function sortImages() {
        filteredImages.sort((a, b) => {
            return sortDescending ? b.rating - a.rating : a.rating - b.rating;
        });
    }
    
    function updateGallery() {
        gallery.innerHTML = '';
        
        if (filteredImages.length === 0) {
            gallery.innerHTML = '<p class="error-message">Изображения не найдены</p>';
            return;
        }
        
        filteredImages.forEach(img => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${img.url}" alt="${img.title}" loading="lazy">
                <div class="image-overlay">
                    <div class="image-info">
                        <div class="image-title">${img.title}</div>
                        <div class="image-rating">${createStarRating(img.rating)}</div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => showImageDetails(img));
            gallery.appendChild(card);
        });
    }
    
    function createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Полные звезды
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        
        // Половина звезды (если есть)
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        // Пустые звезды
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star empty"></i>';
        }
        
        return stars + ` ${rating.toFixed(1)}`;
    }
    
    function updateStats() {
        totalCountSpan.textContent = filteredImages.length;
        const avgRating = filteredImages.length > 0 
            ? filteredImages.reduce((sum, img) => sum + img.rating, 0) / filteredImages.length
            : 0;
        avgRatingSpan.textContent = avgRating.toFixed(1);
    }
    
    function showImageDetails(img) {
        modalTitle.textContent = img.title;
        modalImage.src = img.url;
        modalImage.alt = img.title;
        modalCategory.textContent = img.category;
        modalRating.innerHTML = createStarRating(img.rating);
        modalUrl.href = img.url;
        
        // Анимация загрузки изображения
        modalImage.style.opacity = '0';
        modalImage.onload = function() {
            modalImage.style.opacity = '1';
        };
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function showError(message) {
        gallery.innerHTML = `<p class="error-message">${message}</p>`;
    }
    
    function setupEventListeners() {
        // Автоматическое применение фильтров при изменении
        categorySelect.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', function() {
            if (this.value.length === 0 || this.value.length >= 2) {
                applyFilters();
            }
        });
        
        applyFiltersBtn.addEventListener('click', applyFilters);
        
        sortRatingBtn.addEventListener('click', function() {
            sortDescending = !sortDescending;
            sortDirection.classList.toggle('fa-arrow-up');
            sortDirection.classList.toggle('fa-arrow-down');
            sortRatingBtn.classList.toggle('active');
            applyFilters();
        });
        
        closeBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});