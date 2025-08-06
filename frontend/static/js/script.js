document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const dragDropArea = document.getElementById('dragDropArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const uploadContent = dragDropArea.querySelector('.upload-content');
    const removeImageBtn = document.getElementById('removeImage');
    const promptInput = document.getElementById('promptInput');
    const charCount = document.getElementById('charCount');
    const imageForm = document.getElementById('imageForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loadingSpinner = generateBtn.querySelector('.loading-spinner');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const browseBtn = document.getElementById('browseBtn');
    const resultsGallery = document.getElementById('resultsGallery');
    const noResults = document.getElementById('noResults');
    const imageModal = document.getElementById('imageModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const modalImage = document.getElementById('modalImage');
    const modalText = document.getElementById('modalText');
    const modalDownload = document.getElementById('modalDownload');
    const modalShare = document.getElementById('modalShare');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const generateDescriptionBtn = document.getElementById('generateDescriptionBtn');
    const descriptionBtnText = generateDescriptionBtn?.querySelector('.description-btn-text');
    const descriptionLoadingSpinner = generateDescriptionBtn?.querySelector('.description-loading-spinner');
    
    // New elements for drag-and-drop and product description
    const addImageBtn = document.getElementById('addImageBtn');
    const generateProductDescriptionBtn = document.getElementById('generateProductDescriptionBtn');
    const productDescriptionBtnText = generateProductDescriptionBtn?.querySelector('.product-description-btn-text');
    const productDescriptionLoadingSpinner = generateProductDescriptionBtn?.querySelector('.product-description-loading-spinner');
    const saveProductDescription = document.getElementById('saveProductDescription');
    
    // Multi-angle generation toggle
    const multiAngleToggle = document.getElementById('multiAngleToggle');
    
    // Video generation elements
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const videoBtnText = generateVideoBtn?.querySelector('.video-btn-text');
    const videoLoadingSpinner = generateVideoBtn?.querySelector('.video-loading-spinner');

    let selectedFile = null;
    let currentImageData = null;
    let imageHistory = [];
    let currentPage = 'create';
    let selectedImageForDescription = null; // For AI product description generation
    
    // Global products array for filtering
    var allProducts = [];
    var filteredProducts = [];

    // Drag & Drop işlemleri
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, unhighlight, false);
    });

    dragDropArea.addEventListener('drop', handleDrop, false);
    dragDropArea.addEventListener('click', () => imageInput.click());

    // Browse butonu için ayrı event listener
    browseBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Bubble up'ı önle
        imageInput.click();
    });

    // Add image button event listener
    if (addImageBtn) {
        addImageBtn.addEventListener('click', function() {
            // Create a hidden file input for the add image functionality
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'file';
            hiddenInput.accept = 'image/*';
            hiddenInput.style.display = 'none';
            document.body.appendChild(hiddenInput);
            
            hiddenInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files.length > 0) {
                    handleCustomImageUpload(e.target.files[0]);
                }
                document.body.removeChild(hiddenInput);
            });
            
            hiddenInput.click();
        });
    }

    // Drag and drop for results gallery
    if (resultsGallery) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            resultsGallery.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            resultsGallery.addEventListener(eventName, highlightResultsGallery, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            resultsGallery.addEventListener(eventName, unhighlightResultsGallery, false);
        });

        resultsGallery.addEventListener('drop', handleResultsGalleryDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dragDropArea.classList.add('drag-over');
    }

    function unhighlight() {
        dragDropArea.classList.remove('drag-over');
    }

    function highlightResultsGallery() {
        resultsGallery.classList.add('drag-over');
    }

    function unhighlightResultsGallery() {
        resultsGallery.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleResultsGalleryDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            handleCustomImageUpload(files[0]);
        }
    }

    function handleCustomImageUpload(file) {
        if (!isValidImageFile(file)) {
            showError('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, JPEG, GIF, BMP)');
            return;
        }

        if (file.size > 16 * 1024 * 1024) { // 16MB
            showError('Dosya boyutu 16MB\'dan küçük olmalıdır');
            return;
        }

        // Create a custom image item for the gallery
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = {
                id: Date.now(),
                data: e.target.result,
                text: 'Kullanıcı tarafından eklenen resim',
                timestamp: new Date().toLocaleString('tr-TR'),
                isCustom: true,
                file: file
            };
            
            imageHistory.unshift(imageItem);
            addImageToGallery(imageItem);
            
            // Hide no results message
            if (noResults) {
                noResults.style.display = 'none';
            }
            
            // Enable product save section
            enableProductSave();
            
            showNotification('Resim başarıyla eklendi!');
        };
        reader.readAsDataURL(file);
    }

    // Dosya input değişikliği
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            // Input'u temizle ki aynı dosya tekrar seçilebilsin
            e.target.value = '';
        }
    });

    // Dosya işleme
    function handleFile(file) {
        if (!isValidImageFile(file)) {
            showError('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, JPEG, GIF, BMP)');
            return;
        }

        if (file.size > 16 * 1024 * 1024) { // 16MB
            showError('Dosya boyutu 16MB\'dan küçük olmalıdır');
            return;
        }

        selectedFile = file;
        showImagePreview(file);
    }

    function isValidImageFile(file) {
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp'];
        return allowedTypes.includes(file.type);
    }

    function showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadContent.style.display = 'none';
            previewContainer.style.display = 'block';
            hideError();
        };
        reader.readAsDataURL(file);
    }

    // Resim kaldırma
    removeImageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectedFile = null;
        imageInput.value = '';
        previewContainer.style.display = 'none';
        uploadContent.style.display = 'block';
        hideError();
    });

    // Karakter sayacı
    promptInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = currentLength;
        
        if (currentLength >= 450) {
            charCount.style.color = '#ef4444';
        } else if (currentLength >= 400) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    });

    // Form gönderimi
    imageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateImage();
    });

    // Video generation event
    if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', function() {
            generateVideo();
        });
    }

    function generateImage() {
        if (!selectedFile) {
            showError('Lütfen bir resim dosyası seçin');
            return;
        }

        if (!promptInput.value.trim()) {
            showError('Lütfen ne yapmak istediğinizi açıklayın');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', promptInput.value.trim());
        
        // Multi-angle generation toggle durumunu ekle
        const multiAngleEnabled = multiAngleToggle ? multiAngleToggle.checked : false;
        formData.append('multi_angle', multiAngleEnabled);

        // Loading durumu
        setLoadingState(true);
        hideError();
        // Clear previous results if any
        if (noResults) {
            noResults.style.display = 'block';
        }

        fetch('/generate', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setLoadingState(false);
            
            if (data.success) {
                if (multiAngleEnabled && data.multi_angle_images) {
                    showMultiAngleResults(data);
                } else {
                    showResults(data);
                }
            } else {
                showError(data.error || 'Bir hata oluştu');
            }
        })
        .catch(error => {
            setLoadingState(false);
            console.error('Error:', error);
            showError('Bağlantı hatası. Lütfen tekrar deneyin.');
        });
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('loading');
            
            // Multi-angle toggle durumuna göre farklı mesaj
            const multiAngleEnabled = multiAngleToggle ? multiAngleToggle.checked : false;
            if (multiAngleEnabled) {
                btnText.textContent = '3 Açıdan Oluşturuluyor...';
            } else {
                btnText.textContent = 'Oluşturuluyor...';
            }
            
            btnText.style.opacity = '1';
            loadingSpinner.style.display = 'inline-block';
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
            btnText.textContent = 'Oluştur';
            btnText.style.opacity = '1';
            loadingSpinner.style.display = 'none';
        }
    }

    function generateVideo() {
        if (!selectedFile) {
            showError('Lütfen bir resim dosyası seçin');
            return;
        }

        if (!promptInput.value.trim()) {
            showError('Lütfen ne yapmak istediğinizi açıklayın');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', promptInput.value.trim());

        // Loading durumu
        setVideoLoadingState(true);
        hideError();

        fetch('/generate_video', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setVideoLoadingState(false);
            
            if (data.success) {
                showVideoResults(data);
            } else {
                showError(data.error || 'Video oluşturulurken bir hata oluştu');
            }
        })
        .catch(error => {
            setVideoLoadingState(false);
            console.error('Video Error:', error);
            showError('Video oluşturma bağlantı hatası. Lütfen tekrar deneyin.');
        });
    }

    function setVideoLoadingState(isLoading) {
        if (isLoading) {
            generateVideoBtn.disabled = true;
            generateVideoBtn.classList.add('loading');
            videoBtnText.textContent = 'Video Oluşturuluyor (2-3 dk)...';
            videoBtnText.style.opacity = '1';
            videoLoadingSpinner.style.display = 'inline-block';
        } else {
            generateVideoBtn.disabled = false;
            generateVideoBtn.classList.remove('loading');
            videoBtnText.textContent = 'Video Oluştur';
            videoBtnText.style.opacity = '1';
            videoLoadingSpinner.style.display = 'none';
        }
    }

    function showVideoResults(data) {
        // Hide no results message
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Video item'ı galeriye ekle
        const videoItem = {
            id: Date.now(),
            data: data.video_url,
            text: data.generated_text || 'Oluşturulan video',
            timestamp: new Date().toLocaleString('tr-TR'),
            type: 'video'
        };
        
        imageHistory.unshift(videoItem);
        addVideoToGallery(videoItem);
        
        // Ürün kaydetme bölümünü etkinleştir
        enableProductSave();
        
        showNotification('Video başarıyla oluşturuldu! 🎬');
    }

    function addVideoToGallery(videoItem) {
        const galleryItemHTML = `
            <div class="gallery-item video-item" data-video-id="${videoItem.id}">
                <div class="gallery-item-actions">
                    <button class="delete-image-btn" onclick="deleteVideo('${videoItem.id}', event)" title="Videoyu Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="edit-image-btn" onclick="editVideo('${videoItem.id}', event)" title="Videoyu Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="save-image-btn" onclick="saveVideo('${videoItem.id}', event)" title="Videoyu Kaydet">
                        <i class="fas fa-save"></i>
                    </button>
                </div>
                <video src="${videoItem.data}" controls onclick="openVideoModal('${videoItem.id}')">
                    Tarayıcınız video oynatmayı desteklemiyor.
                </video>
                <div class="gallery-item-overlay" onclick="openVideoModal('${videoItem.id}')">
                    <div class="gallery-item-time">
                        <i class="fas fa-clock"></i>
                        ${videoItem.timestamp}
                    </div>
                    <div class="video-badge">
                        <i class="fas fa-video"></i>
                        Video
                    </div>
                </div>
            </div>
        `;
        
        resultsGallery.insertAdjacentHTML('afterbegin', galleryItemHTML);
    }

    function showResults(data) {
        currentImageData = data.generated_image;
        
        // Add to image history
        const imageItem = {
            id: Date.now(),
            data: data.generated_image,
            text: data.generated_text || '',
            timestamp: new Date().toLocaleString('tr-TR')
        };
        
        imageHistory.unshift(imageItem);
        addImageToGallery(imageItem);
        
        // Hide no results message
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Ürün kaydetme bölümünü etkinleştir
        enableProductSave();
        
        // Backend'den gelen resim yollarını sakla
        if (data.generated_image_path) {
            currentGeneratedImagePath = data.generated_image_path;
        }
        
        if (data.original_image_path) {
            currentOriginalImagePath = data.original_image_path;
        }
    }

    function showMultiAngleResults(data) {
        // Hide no results message
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Multi-angle images'ları galeriye ekle
        if (data.multi_angle_images && Array.isArray(data.multi_angle_images)) {
            data.multi_angle_images.forEach((imageData, index) => {
                const imageItem = {
                    id: Date.now() + index,
                    data: `data:image/png;base64,${imageData.image}`,
                    text: imageData.description || `Açı ${index + 1}`,
                    timestamp: new Date().toLocaleString('tr-TR'),
                    angle: index + 1
                };
                
                imageHistory.unshift(imageItem);
                addMultiAngleImageToGallery(imageItem);
            });
        }
        
        // Ürün kaydetme bölümünü etkinleştir
        enableProductSave();
        
        // Backend'den gelen resim yollarını sakla (ilk resmi kullan)
        if (data.multi_angle_images && data.multi_angle_images.length > 0) {
            currentGeneratedImagePath = data.multi_angle_images[0].image_path;
        }
        
        if (data.original_image_path) {
            currentOriginalImagePath = data.original_image_path;
        }
    }

    function addMultiAngleImageToGallery(imageItem) {
        const galleryItemHTML = `
            <div class="gallery-item multi-angle-item" data-image-id="${imageItem.id}">
                <div class="gallery-item-actions">
                    <button class="delete-image-btn" onclick="deleteImage('${imageItem.id}', event)" title="Resmi Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="edit-image-btn" onclick="editImage('${imageItem.id}', event)" title="Resmi Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="save-image-btn" onclick="saveImage('${imageItem.id}', event)" title="Resmi Kaydet">
                        <i class="fas fa-save"></i>
                    </button>
                </div>
                <img src="${imageItem.data}" alt="Oluşturulan resim" onclick="openModal('${imageItem.id}')">
                <div class="gallery-item-overlay" onclick="openModal('${imageItem.id}')">
                    <div class="gallery-item-time">
                        <i class="fas fa-clock"></i>
                        ${imageItem.timestamp}
                    </div>
                    <div class="angle-badge">
                        <i class="fas fa-camera-rotate"></i>
                        Açı ${imageItem.angle}
                    </div>
                </div>
            </div>
        `;
        
        resultsGallery.insertAdjacentHTML('afterbegin', galleryItemHTML);
    }

    function addImageToGallery(imageItem) {
        const galleryItemHTML = `
            <div class="gallery-item" data-image-id="${imageItem.id}">
                <div class="gallery-item-actions">
                    <button class="delete-image-btn" onclick="deleteImage('${imageItem.id}', event)" title="Resmi Sil">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="edit-image-btn" onclick="editImage('${imageItem.id}', event)" title="Resmi Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="save-image-btn" onclick="saveImage('${imageItem.id}', event)" title="Ürünü Kaydet">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <img src="${imageItem.data}" alt="Oluşturulan resim" onclick="openModal('${imageItem.id}')">
                <div class="gallery-item-overlay" onclick="openModal('${imageItem.id}')">
                    <div class="gallery-item-time">${imageItem.timestamp}</div>
                </div>
            </div>
        `;
        
        resultsGallery.insertAdjacentHTML('afterbegin', galleryItemHTML);
    }

    // Modal functions
    window.openModal = function(imageId) {
        const imageItem = imageHistory.find(item => item.id == imageId);
        if (!imageItem) return;
        
        modalImage.src = imageItem.data;
        modalText.textContent = imageItem.text;
        imageModal.style.display = 'flex';
        currentImageData = imageItem.data;
        
        // Store current image for download/share
        modalDownload.onclick = () => downloadImage(imageItem.data, `gemini-${imageItem.id}.png`);
        modalShare.onclick = () => shareImage(imageItem.data);
    };

    // Video modal functions
    window.openVideoModal = function(videoId) {
        const videoItem = imageHistory.find(item => item.id == videoId);
        if (!videoItem) return;
        
        // Create video modal content
        const videoModalHTML = `
            <div class="video-modal" id="videoModal">
                <div class="modal-backdrop" id="videoModalBackdrop"></div>
                <div class="modal-content">
                    <button class="modal-close" id="videoModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                    <video src="${videoItem.data}" controls style="max-width: 100%; max-height: 70vh;">
                        Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                    <div class="modal-text">${videoItem.text}</div>
                    <div class="modal-actions">
                        <button class="modal-action-btn" onclick="downloadVideo('${videoItem.data}', 'gemini-video-${videoItem.id}.mp4')">
                            <i class="fas fa-download"></i> İndir
                        </button>
                        <button class="modal-action-btn" onclick="shareVideo('${videoItem.data}')">
                            <i class="fas fa-share"></i> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing video modal if any
        const existingModal = document.getElementById('videoModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add video modal to body
        document.body.insertAdjacentHTML('beforeend', videoModalHTML);
        
        // Get modal elements
        const videoModal = document.getElementById('videoModal');
        const videoModalBackdrop = document.getElementById('videoModalBackdrop');
        const videoModalClose = document.getElementById('videoModalClose');
        
        // Show modal
        videoModal.style.display = 'flex';
        
        // Close modal event listeners
        videoModalClose.addEventListener('click', () => closeVideoModal());
        videoModalBackdrop.addEventListener('click', () => closeVideoModal());
        
        // Close with escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal.style.display === 'flex') {
                closeVideoModal();
            }
        });
    };

    function closeVideoModal() {
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.remove();
        }
    }

    function closeModal() {
        imageModal.style.display = 'none';
    }

    // Modal event listeners
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal.style.display === 'flex') {
            closeModal();
        }
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // Sidebar functionality
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('mobile-active');
        });
    }

    // Navigation handling for top navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('onclick')?.match(/handlePageChange\('([^']+)'\)/)?.[1];
            
            if (page) {
                // Update active navigation
                document.querySelectorAll('.nav-btn').forEach(navBtn => {
                    navBtn.classList.remove('active');
                });
                this.classList.add('active');
                
                // Update current page
                currentPage = page;
                
                // Handle page content
                handlePageChange(page);
            }
        });
    });

    function handlePageChange(page) {
        // Hide all pages
        document.querySelectorAll('.page-container').forEach(pageContainer => {
            pageContainer.style.display = 'none';
        });
        
        // Also hide the products page specifically
        const productsPage = document.getElementById('productsPage');
        if (productsPage) {
            productsPage.style.display = 'none';
        }
        
        // Show selected page
        if (page === 'products') {
            // Show products page
            if (productsPage) {
                productsPage.style.display = 'flex';
            }
        } else {
            // Show other pages
            const targetPage = document.getElementById(`${page}Page`);
            if (targetPage) {
                targetPage.style.display = 'flex';
            }
        }
        
        // Update current page
        currentPage = page;
        
        // Update navigation state
        updateNavigationState(page);
        
        // Load products if switching to products page
        if (page === 'products') {
            loadProducts();
        }
        
        // Load profile stats if switching to profile page
        if (page === 'profile') {
            loadProfileStats();
        }
        
        console.log(`Navigated to: ${page} page`);
    }

    // Update navigation button states
    function updateNavigationState(currentPage) {
        // Get navigation buttons
        const createBtn = document.querySelector('.create-nav-btn');
        const productsBtn = document.querySelector('.products-nav-btn');
        const profileBtn = document.querySelector('.profile-nav-btn');
        const logoutBtn = document.querySelector('.logout-nav-btn');
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set active state
        if (currentPage === 'create' && createBtn) createBtn.classList.add('active');
        if (currentPage === 'products' && productsBtn) productsBtn.classList.add('active');
        if (currentPage === 'profile' && profileBtn) profileBtn.classList.add('active');
    }

    // Global logout function
    window.handleLogout = async function() {
        console.log('Logout requested');
        
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                // Use the global showNotification function
                if (window.showNotification) {
                    window.showNotification('Başarıyla çıkış yapıldı', 'success');
                }
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                console.error('Logout failed:', response.status);
                if (window.showNotification) {
                    window.showNotification('Çıkış yapılırken hata oluştu', 'error');
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
            if (window.showNotification) {
                window.showNotification('Bağlantı hatası', 'error');
            }
        }
    };

    // Initialize page system
    function initializePages() {
        // Show create page by default
        handlePageChange('create');
        
        // Initialize navigation state
        updateNavigationState('create');
    }

    // Call initialization when DOM is loaded
    initializePages();
    
    // Initialize search functionality
    initializeSearchFunctionality();

    // Load Products Function
    function loadProducts() {
        console.log('loadProducts function called');
        const productsGrid = document.getElementById('productsGrid');
        const emptyProducts = document.getElementById('emptyProducts');
        const totalProducts = document.getElementById('totalProducts');
        const filteredCount = document.getElementById('filteredCount');
        
        console.log('Elements found:', { productsGrid: !!productsGrid, emptyProducts: !!emptyProducts, totalProducts: !!totalProducts });
        
        if (!productsGrid || !emptyProducts || !totalProducts) {
            console.error('Required elements not found');
            return;
        }
        
        // Show loading state
        productsGrid.innerHTML = '<div class="loading">Ürünler yükleniyor...</div>';
        emptyProducts.style.display = 'none';
        productsGrid.style.display = 'grid';
        
        console.log('Fetching products from /get_products...');
        
        // Fetch products from backend
        fetch('/get_products')
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.success) {
                const products = data.products;
                console.log('Products found:', products.length);
                
                // Store products in global arrays for search functionality
                allProducts = products;
                filteredProducts = [...products];
                
                // Update products count
                if (totalProducts) {
                    totalProducts.textContent = products.length;
                }
                if (filteredCount) {
                    filteredCount.textContent = products.length;
                }
                
                // Clear grid
                productsGrid.innerHTML = '';
                
                if (products.length === 0) {
                    console.log('No products found, showing empty state');
                    emptyProducts.style.display = 'block';
                    productsGrid.style.display = 'none';
                } else {
                    console.log('Creating product cards...');
                    emptyProducts.style.display = 'none';
                    productsGrid.style.display = 'grid';
                    
                    // Create product cards
                    products.forEach(product => {
                        console.log('Creating card for product:', product);
                        
                        // Determine which image to display - use first image from all_images if available
                        let displayImagePath = product.original_image_path;
                        if (product.all_images && product.all_images.length > 0) {
                            // Sort images by creation date to ensure first uploaded is first
                            const sortedImages = product.all_images.sort((a, b) => {
                                return new Date(a.created_at) - new Date(b.created_at);
                            });
                            displayImagePath = sortedImages[0].path;
                        }
                        
                        // Convert image paths to displayable format
                        const displayProduct = {
                            ...product,
                            image: `/static/uploads/${displayImagePath}` // Use first uploaded image for display
                        };
                        const productCard = createProductCard(displayProduct);
                        productsGrid.appendChild(productCard);
                    });
                }
            } else {
                console.error('API returned error:', data.error);
                showNotification(data.error || 'Ürünler yüklenirken hata oluştu', 'error');
                emptyProducts.style.display = 'block';
                productsGrid.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Load Products Error:', error);
            showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
            emptyProducts.style.display = 'block';
            productsGrid.style.display = 'none';
        });
    }
    
    // Initialize Search Functionality
    function initializeSearchFunctionality() {
        // Initialize search functionality
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', debounce(handleProductSearch, 300));
        }

        // Initialize filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', handleProductFilter);
        }

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', handleProductSort);
        }

        // Initialize view toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.getAttribute('data-view');
                toggleProductView(view);
            });
        });
    }

    // Debounce function for search
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

    // Handle product search
    function handleProductSearch() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase().trim();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        // Ensure allProducts is defined
        if (typeof allProducts === 'undefined') {
            allProducts = [];
        }
        if (typeof filteredProducts === 'undefined') {
            filteredProducts = [];
        }
        
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = searchTerm === '' || 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm));
            
            const matchesCategory = categoryFilter === '' || 
                product.name.toLowerCase().includes(categoryFilter);
            
            return matchesSearch && matchesCategory;
        });
        
        applyCurrentSort();
        renderFilteredProducts();
        updateFilteredCount();
    }

    // Handle product filter
    function handleProductFilter() {
        handleProductSearch(); // Reuse search logic with filter
    }

    // Handle product sort
    function handleProductSort() {
        applyCurrentSort();
        renderFilteredProducts();
    }

    // Apply current sort to filtered products
    function applyCurrentSort() {
        const sortBy = document.getElementById('sortBy').value;
        
        // Ensure filteredProducts is defined
        if (typeof filteredProducts === 'undefined') {
            filteredProducts = [];
        }
        
        filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.id - a.id; // Assuming higher ID means newer
                case 'oldest':
                    return a.id - b.id;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }

    // Render filtered products
    function renderFilteredProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyProducts = document.getElementById('emptyProducts');
        
        // Ensure allProducts and filteredProducts are defined
        if (typeof allProducts === 'undefined') {
            allProducts = [];
        }
        if (typeof filteredProducts === 'undefined') {
            filteredProducts = [];
        }
        
        if (!productsGrid) return;
        
        if (filteredProducts.length === 0) {
            productsGrid.style.display = 'none';
            
            if (allProducts.length === 0) {
                // No products at all - show empty state
                if (emptyProducts) emptyProducts.style.display = 'flex';
            } else {
                // No search results - show no results message
                productsGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>Arama sonucu bulunamadı</h3>
                        <p>Arama kriterlerinizi değiştirip tekrar deneyin.</p>
                    </div>
                `;
                productsGrid.style.display = 'block';
                if (emptyProducts) emptyProducts.style.display = 'none';
            }
        } else {
            // Clear grid and render filtered products
            productsGrid.innerHTML = '';
            productsGrid.style.display = 'grid';
            if (emptyProducts) emptyProducts.style.display = 'none';
            
            filteredProducts.forEach(product => {
                // Determine which image to display
                let displayImagePath = product.original_image_path;
                if (product.all_images && product.all_images.length > 0) {
                    const sortedImages = product.all_images.sort((a, b) => {
                        return new Date(a.created_at) - new Date(b.created_at);
                    });
                    displayImagePath = sortedImages[0].path;
                }
                
                const displayProduct = {
                    ...product,
                    image: `/static/uploads/${displayImagePath}`
                };
                const productCard = createProductCard(displayProduct);
                productsGrid.appendChild(productCard);
            });
        }
    }

    // Update filtered count
    function updateFilteredCount() {
        const filteredCountElement = document.getElementById('filteredCount');
        if (filteredCountElement) {
            // Ensure filteredProducts is defined
            if (typeof filteredProducts === 'undefined') {
                filteredProducts = [];
            }
            filteredCountElement.textContent = filteredProducts.length;
        }
    }

    // Toggle product view
    function toggleProductView(view) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            if (view === 'list') {
                productsGrid.classList.add('list-view');
                productsGrid.classList.remove('grid-view');
            } else {
                productsGrid.classList.add('grid-view');
                productsGrid.classList.remove('list-view');
            }
        }
    }
    
    // Create Product Card Function
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        
        // Add click event to the entire card
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            // Prevent click if clicking on the delete button
            if (e.target.closest('.btn-secondary')) {
                return;
            }
            openProductDetail(product.id);
        });
        
        // Truncate description for display
        const shortDescription = product.description && product.description.length > 120 
            ? product.description.substring(0, 120) + '...' 
            : (product.description || 'Açıklama yok');
        
        // Format date
        const createdDate = new Date().toLocaleDateString('tr-TR');
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='/static/uploads/default.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${shortDescription}</p>
                <div class="product-meta">
                    <div class="product-date">
                        <i class="fas fa-calendar"></i>
                        <span>${createdDate}</span>
                    </div>
                    <div class="product-category">
                        <i class="fas fa-tag"></i>
                        <span>Genel</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="deleteProductFromCard('${product.id}')" title="Ürünü Sil">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Edit Product From Card
    window.editProductFromCard = function(productId) {
        // Fetch product from backend
        fetch(`/get_products`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const product = data.products.find(p => p.id == productId);
                
                if (!product) {
                    showNotification('Ürün bulunamadı', 'error');
                    return;
                }
                
                // Switch to create page
                handlePageChange('create');
                
                showNotification('Ürün düzenleme özelliği artık ürün detay sayfasından yapılmaktadır', 'info');
            } else {
                showNotification(data.error || 'Ürün bilgileri alınırken hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Edit Product Error:', error);
            showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        });
    };
    
    // Delete Product From Card
    window.deleteProductFromCard = function(productId) {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            fetch('/delete_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload products display
                    loadProducts();
                    showNotification('Ürün başarıyla silindi', 'success');
                } else {
                    showNotification(data.error || 'Ürün silinirken hata oluştu', 'error');
                }
            })
            .catch(error => {
                console.error('Delete Product Error:', error);
                showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
            });
        }
    };

    // Product Detail Functions
    let currentEditingProduct = null;
    let originalProductData = null;
    let productImages = []; // Array to store all images for the product
    let currentImageIndex = 0; // Current image index

    // Open Product Detail Modal
    window.openProductDetail = function(productId) {
        // Fetch product from backend
        fetch('/get_products')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const product = data.products.find(p => p.id == productId);
                
                if (!product) {
                    showNotification('Ürün bulunamadı', 'error');
                    return;
                }
                
                // Store current product for editing
                currentEditingProduct = product;
                originalProductData = { ...product };
                
                // Initialize product images array with all images
                productImages = [];
                
                console.log('openProductDetail - product.all_images:', product.all_images);
                console.log('openProductDetail - product.all_images.length:', product.all_images ? product.all_images.length : 0);
                
                // Use all_images if available, otherwise fall back to original/generated paths
                if (product.all_images && product.all_images.length > 0) {
                    // Sort images by creation date to ensure correct order
                    const sortedImages = product.all_images.sort((a, b) => {
                        return new Date(a.created_at) - new Date(b.created_at);
                    });
                    sortedImages.forEach(image => {
                        // Determine the correct path based on image type
                        let imagePath;
                        if (image.type === 'generated') {
                            imagePath = `/static/uploads/${image.path}`; // Generated images are also served from /static/uploads/
                        } else {
                            imagePath = `/static/uploads/${image.path}`; // Original and custom images
                        }
                        productImages.push(imagePath);
                    });
                } else {
                    // Fallback to original behavior for backward compatibility
                    if (product.original_image_path) {
                        productImages.push(`/static/uploads/${product.original_image_path}`);
                    }
                    if (product.generated_image_path) {
                        productImages.push(`/static/uploads/${product.generated_image_path}`);
                    }
                }
                console.log('openProductDetail - productImages after population:', productImages);
                currentImageIndex = 0;
                
                // Populate modal with product data
                document.getElementById('modalProductName').textContent = product.name;
                
                // İlk medya dosyasını göster (resim veya video)
                const firstMedia = productImages[0] || '/static/uploads/default.jpg';
                const isVideo = firstMedia && (firstMedia.toLowerCase().endsWith('.mp4') || 
                                              firstMedia.toLowerCase().endsWith('.avi') || 
                                              firstMedia.toLowerCase().endsWith('.mov') || 
                                              firstMedia.toLowerCase().endsWith('.wmv'));
                
                const modalImage = document.getElementById('modalProductImage');
                const modalVideo = document.getElementById('modalProductVideo');
                
                if (isVideo) {
                    // Video göster
                    modalImage.style.display = 'none';
                    modalVideo.style.display = 'block';
                    modalVideo.src = firstMedia;
                } else {
                    // Resim göster
                    modalImage.style.display = 'block';
                    modalVideo.style.display = 'none';
                    modalImage.src = firstMedia;
                }
                
                document.getElementById('modalProductNameInput').value = product.name;
                document.getElementById('modalProductDescInput').value = product.description;
                
                // Set product price display
                const priceInput = document.getElementById('modalProductPriceInput');
                if (priceInput) {
                    const price = product.price || 299.99;
                    priceInput.value = price;
                }
                
                // Update modal character count
                const modalDetailCharCount = document.getElementById('modalDetailCharCount');
                if (modalDetailCharCount) {
                    modalDetailCharCount.textContent = `${product.description.length}/500 karakter`;
                }
                
                // Update modal image counter
                modalUpdateImageCounter();
                
                // Update modal navigation buttons
                modalUpdateNavigationButtons();
                
                // Show modal
                document.getElementById('productDetailModal').style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                
                // Reset modal edit mode
                modalResetEditMode();
            } else {
                showNotification(data.error || 'Ürün bilgileri alınırken hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Open Product Detail Error:', error);
            showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        });
    }

    // Go back to products page
    window.goBackToProducts = function() {
        document.querySelectorAll('.page-container').forEach(container => {
            container.style.display = 'none';
        });
        document.getElementById('productsPage').style.display = 'flex';
        
        // Clear current product
        currentEditingProduct = null;
        originalProductData = null;
        productImages = [];
        currentImageIndex = 0;
    };

    // Image Navigation Functions
    window.navigateImage = function(direction) {
        if (productImages.length <= 1) return;
        
        currentImageIndex += direction;
        
        // Handle circular navigation
        if (currentImageIndex < 0) {
            currentImageIndex = productImages.length - 1;
        } else if (currentImageIndex >= productImages.length) {
            currentImageIndex = 0;
        }
        
        // Update displayed image
        document.getElementById('detailProductImage').src = productImages[currentImageIndex];
        
        // Update counter
        updateImageCounter();
        
        // Update navigation buttons
        updateNavigationButtons();
    };

    // Update Image Counter
    function updateImageCounter() {
        const currentIndexElement = document.getElementById('currentImageIndex');
        const totalImagesElement = document.getElementById('totalImages');
        
        if (currentIndexElement && totalImagesElement) {
            currentIndexElement.textContent = currentImageIndex + 1;
            totalImagesElement.textContent = productImages.length;
        }
    }

    // Update Navigation Buttons
    function updateNavigationButtons() {
        const prevBtn = document.querySelector('.image-nav-prev');
        const nextBtn = document.querySelector('.image-nav-next');
        
        if (prevBtn && nextBtn) {
            // Show/hide buttons based on number of images
            if (productImages.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }
    }

    // Toggle Edit Mode
    window.toggleEditMode = function() {
        const nameInput = document.getElementById('detailProductNameInput');
        const descInput = document.getElementById('detailProductDescInput');
        const imageOverlay = document.getElementById('imageUploadOverlay');
        const editBtn = document.getElementById('editModeBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        // Enable editing
        nameInput.readOnly = false;
        descInput.readOnly = false;
        imageOverlay.style.display = 'flex';
        
        // Show save/cancel buttons
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
        
        // Add character count listener
        descInput.addEventListener('input', updateDetailCharCount);
        
        // Add image upload listener
        const detailImageInput = document.getElementById('detailImageInput');
        detailImageInput.addEventListener('change', handleDetailImageUpload);
        imageOverlay.addEventListener('click', () => detailImageInput.click());
    };

    // Reset Edit Mode
    function resetEditMode() {
        const nameInput = document.getElementById('detailProductNameInput');
        const descInput = document.getElementById('detailProductDescInput');
        const imageOverlay = document.getElementById('imageUploadOverlay');
        const editBtn = document.getElementById('editModeBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        // Disable editing
        nameInput.readOnly = true;
        descInput.readOnly = true;
        imageOverlay.style.display = 'none';
        
        // Show edit button
        editBtn.style.display = 'inline-flex';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        // Remove listeners
        descInput.removeEventListener('input', updateDetailCharCount);
    }

    // Update Detail Character Count
    function updateDetailCharCount() {
        const descInput = document.getElementById('detailProductDescInput');
        const charCount = document.getElementById('detailCharCount');
        const length = descInput.value.length;
        charCount.textContent = `${length}/500 karakter`;
    }

    // Handle Detail Image Upload
    function handleDetailImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!isValidImageFile(file)) {
            showNotification('Lütfen geçerli bir resim dosyası seçin', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const newImageSrc = e.target.result;
            
            // Add new image to product images array
            if (!productImages.includes(newImageSrc)) {
                productImages.push(newImageSrc);
            }
            
            // Set as current image
            currentImageIndex = productImages.length - 1;
            document.getElementById('detailProductImage').src = newImageSrc;
            
            // Update counter and navigation
            updateImageCounter();
            updateNavigationButtons();
            
            showNotification('Görsel başarıyla eklendi', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Save Product Changes
    window.saveProductChanges = function() {
        if (!currentEditingProduct) return;
        
        const nameInput = document.getElementById('detailProductNameInput');
        const descInput = document.getElementById('detailProductDescInput');
        const imageElement = document.getElementById('detailProductImage');
        
        const newName = nameInput.value.trim();
        const newDescription = descInput.value.trim();
        const newImage = imageElement.src;
        
        if (!newName) {
            showNotification('Ürün adı boş olamaz', 'error');
            return;
        }
        
        if (!newDescription) {
            showNotification('Ürün açıklaması boş olamaz', 'error');
            return;
        }
        
        // Update product data
        currentEditingProduct.name = newName;
        currentEditingProduct.description = newDescription;
        currentEditingProduct.image = newImage;
        currentEditingProduct.images = [...productImages]; // Save all images

        // Send update to backend
        fetch('/update_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: currentEditingProduct.id,
                name: newName,
                description: newDescription,
                image: newImage,
                images: productImages
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update page title
                document.getElementById('detailProductName').textContent = newName;
                
                // Reset edit mode
                resetEditMode();
                
                showNotification('Ürün başarıyla güncellendi', 'success');
            } else {
                showNotification('Ürün güncellenirken hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Error updating product:', error);
            showNotification('Ürün güncellenirken hata oluştu', 'error');
        });
    };

    // Cancel Edit
    window.cancelEdit = function() {
        if (!originalProductData) return;
        
        // Restore original data
        document.getElementById('detailProductNameInput').value = originalProductData.name;
        document.getElementById('detailProductDescInput').value = originalProductData.description;
        document.getElementById('detailProductName').textContent = originalProductData.name;
        
        // Restore original images with proper path handling
        if (originalProductData.images && originalProductData.images.length > 0) {
            productImages = [...originalProductData.images];
            // Ensure the first image is properly set
            if (productImages[0] && productImages[0].startsWith('/static/uploads/')) {
                document.getElementById('detailProductImage').src = productImages[0];
            } else {
                document.getElementById('detailProductImage').src = originalProductData.image;
            }
        } else {
            productImages = [originalProductData.image];
            document.getElementById('detailProductImage').src = originalProductData.image;
        }
        currentImageIndex = 0;
        
        // Update character count
        const detailCharCount = document.getElementById('detailCharCount');
        if (detailCharCount) {
            detailCharCount.textContent = `${originalProductData.description.length}/500 karakter`;
        }
        
        // Update image counter and navigation
        updateImageCounter();
        updateNavigationButtons();
        
        // Reset edit mode
        resetEditMode();
        
        showNotification('Değişiklikler iptal edildi', 'success');
    };

    // Product description character count
    const productDescTextarea = document.getElementById('productDescription');
    const productDescCharCount = document.getElementById('productDescCharCount');
    
    if (productDescTextarea && productDescCharCount) {
        productDescTextarea.addEventListener('input', function() {
            const length = this.value.length;
            productDescCharCount.textContent = `${length}/500`;
        });
    }

    // Save image functionality - Redirect to new save approach
    window.saveImage = function(imageId, event) {
        // Prevent modal from opening
        if (event) {
            event.stopPropagation();
        }
        
        // Switch to create page and show the product save section
        handlePageChange('create');
        
        // Find the image item and set it as current for saving
        const imageItem = imageHistory.find(item => item.id == imageId);
        if (imageItem) {
            // Enable the product save section
            enableProductSave();
            
            // Show notification to guide user
            showNotification('Ürün kaydetme bölümü açıldı. Lütfen ürün adı ve açıklamasını girip "Ürünü Kaydet" butonuna tıklayın.', 'info');
        } else {
            showNotification('Resim bulunamadı', 'error');
        }
    };

    // Edit image functionality
    window.editImage = function(imageId, event) {
        // Prevent modal from opening
        if (event) {
            event.stopPropagation();
        }
        
        const imageItem = imageHistory.find(item => item.id == imageId);
        if (!imageItem) return;
        
        // Set the image as the reference image for editing
        if (selectedFile) {
            // Show edit dialog
            const newPrompt = prompt('Bu görseli nasıl düzenlemek istiyorsunuz?\n\nÖrnek: "Arka planı plaj manzarası yap", "Daha dinamik pozisyon ekle"', '');
            
            if (newPrompt && newPrompt.trim()) {
                // Use the current image as reference and create new image with the prompt
                editImageWithPrompt(imageItem, newPrompt.trim());
            }
        } else {
            showNotification('Düzenleme için önce bir referans resim yüklemelisiniz', 'error');
        }
    };
    
    // Edit image with prompt function
    function editImageWithPrompt(referenceImage, prompt) {
        if (!selectedFile) {
            showNotification('Düzenleme için referans resim gerekli', 'error');
            return;
        }
        
        setLoadingState(true);
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', prompt);
        
        fetch('/generate', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else if (data.generated_image) {
                // Add new edited image to gallery (don't remove original)
                const newImageItem = {
                    id: Date.now(),
                    data: data.generated_image,
                    timestamp: new Date().toLocaleString('tr-TR'),
                    prompt: prompt,
                    isEdited: true,
                    originalId: referenceImage.id
                };
                
                imageHistory.unshift(newImageItem);
                addImageToGallery(newImageItem);
                showNotification('Düzenlenmiş görsel oluşturuldu! 🎨');
            }
        })
        .catch(error => {
            console.error('Edit Error:', error);
            showError('Düzenleme sırasında bir hata oluştu');
        })
        .finally(() => {
            setLoadingState(false);
        });
    }

    // Delete image functionality
    window.deleteImage = function(imageId, event) {
        // Prevent modal from opening
        if (event) {
            event.stopPropagation();
        }
        
        // Show confirmation dialog
        if (confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
            // Remove from imageHistory array
            const imageIndex = imageHistory.findIndex(item => item.id == imageId);
            if (imageIndex !== -1) {
                imageHistory.splice(imageIndex, 1);
            }
            
            // Remove from DOM
            const galleryItem = document.querySelector(`[data-image-id="${imageId}"]`);
            if (galleryItem) {
                galleryItem.style.transform = 'scale(0)';
                galleryItem.style.opacity = '0';
                
                setTimeout(() => {
                    galleryItem.remove();
                    
                    // Show "no results" if gallery is empty
                    if (imageHistory.length === 0 && noResults) {
                        noResults.style.display = 'block';
                    }
                }, 300);
            }
            
            // Close modal if it's open for this image
            if (imageModal.style.display === 'flex') {
                const modalImageSrc = modalImage.src;
                const deletedImage = imageHistory.find(item => item.id == imageId);
                if (deletedImage && modalImageSrc === deletedImage.data) {
                    closeModal();
                }
            }
            
            showNotification('Resim başarıyla silindi');
        }
    };

    // Generate Description functionality
    if (generateDescriptionBtn) {
        generateDescriptionBtn.addEventListener('click', function() {
            generateDescription();
        });
    }

    function generateDescription() {
        if (!selectedFile) {
            showError('Önce bir resim yüklemeniz gerekiyor');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        // Loading durumu
        setDescriptionLoadingState(true);
        hideError();

        fetch('/generate_description', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setDescriptionLoadingState(false);
            
            if (data.success) {
                promptInput.value = data.description;
                
                // Karakter sayısını güncelle
                const currentLength = data.description.length;
                charCount.textContent = currentLength;
                
                if (currentLength >= 450) {
                    charCount.style.color = '#ef4444';
                } else if (currentLength >= 400) {
                    charCount.style.color = '#f59e0b';
                } else {
                    charCount.style.color = '#6b7280';
                }
                
                // Orijinal resim yolunu sakla
                if (data.original_image_path) {
                    currentOriginalImagePath = data.original_image_path;
                }
                
                showNotification('Açıklama başarıyla oluşturuldu!');
            } else {
                showError(data.error || 'Açıklama oluşturulurken hata oluştu');
            }
        })
        .catch(error => {
            setDescriptionLoadingState(false);
            console.error('Description Error:', error);
            showError('Bağlantı hatası. Lütfen tekrar deneyin.');
        });
    }

    function setDescriptionLoadingState(isLoading) {
        if (!generateDescriptionBtn) return;
        
        if (isLoading) {
            generateDescriptionBtn.disabled = true;
            if (descriptionBtnText) descriptionBtnText.style.opacity = '0';
            if (descriptionLoadingSpinner) descriptionLoadingSpinner.style.display = 'inline-block';
        } else {
            generateDescriptionBtn.disabled = false;
            if (descriptionBtnText) descriptionBtnText.style.opacity = '1';
            if (descriptionLoadingSpinner) descriptionLoadingSpinner.style.display = 'none';
        }
    }

    function generateProductDescription() {
        // First check if there's a selected file (uploaded image)
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            sendProductDescriptionRequest(formData);
            return;
        }

        // If no selected file, check if there are any images in the gallery
        if (imageHistory.length === 0) {
            showError('Önce bir resim yüklemeniz gerekiyor');
            return;
        }

        // Use the first image in the gallery for description generation
        const firstImage = imageHistory[0];
        
        if (!firstImage.file && !firstImage.isCustom) {
            showError('Resim dosyası bulunamadı. Lütfen yeni bir resim ekleyin.');
            return;
        }

        const formData = new FormData();
        
        // If it's a custom image, use the file directly
        if (firstImage.file) {
            formData.append('image', firstImage.file);
        } else {
            // For AI-generated images, we need to convert base64 to blob
            fetch(firstImage.data)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'image.png', { type: 'image/png' });
                    formData.append('image', file);
                    sendProductDescriptionRequest(formData);
                })
                .catch(error => {
                    console.error('Error converting image:', error);
                    showError('Resim işlenirken hata oluştu');
                });
            return;
        }

        sendProductDescriptionRequest(formData);
    }

    function sendProductDescriptionRequest(formData) {
        // Loading state
        setProductDescriptionLoadingState(true);
        hideError();

        fetch('/generate_product_description', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setProductDescriptionLoadingState(false);
            
            if (data.success) {
                saveProductDescription.value = data.description;
                showNotification('Ürün açıklaması başarıyla oluşturuldu!');
            } else {
                showError(data.error || 'Ürün açıklaması oluşturulurken hata oluştu');
            }
        })
        .catch(error => {
            setProductDescriptionLoadingState(false);
            console.error('Product Description Error:', error);
            showError('Bağlantı hatası. Lütfen tekrar deneyin.');
        });
    }

    function setProductDescriptionLoadingState(isLoading) {
        if (!generateProductDescriptionBtn) return;
        
        if (isLoading) {
            generateProductDescriptionBtn.disabled = true;
            if (productDescriptionBtnText) productDescriptionBtnText.style.opacity = '0';
            if (productDescriptionLoadingSpinner) productDescriptionLoadingSpinner.style.display = 'inline-block';
        } else {
            generateProductDescriptionBtn.disabled = false;
            if (productDescriptionBtnText) productDescriptionBtnText.style.opacity = '1';
            if (productDescriptionLoadingSpinner) productDescriptionLoadingSpinner.style.display = 'none';
        }
    }

    // Download and share functions
    function downloadImage(imageData, filename) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename || `gemini-generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function shareImage(imageData) {
        if (navigator.share) {
            fetch(imageData)
                .then(response => response.blob())
                .then(blob => {
                    const file = new File([blob], 'gemini-generated.png', { type: 'image/png' });
                    return navigator.share({
                        title: 'Gemini AI ile Oluşturulan Resim',
                        text: 'Bu resmi Gemini AI ile oluşturdum!',
                        files: [file]
                    });
                })
                .catch(error => {
                    console.log('Paylaşma hatası:', error);
                    copyToClipboard(imageData);
                });
        } else {
            copyToClipboard(imageData);
        }
    }

    function copyToClipboard(imageData) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>Oluşturulan Resim</title></head>
                <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
                    <img src="${imageData}" style="max-width:100%; max-height:100vh;" alt="Oluşturulan resim">
                </body>
            </html>
        `);
        
        showNotification('Resim yeni sekmede açıldı');
    }

    // Video functions
    window.downloadVideo = function(videoData, filename) {
        const link = document.createElement('a');
        link.href = videoData;
        link.download = filename || `gemini-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Video indiriliyor...');
    };

    window.shareVideo = function(videoData) {
        if (navigator.share) {
            fetch(videoData)
                .then(response => response.blob())
                .then(blob => {
                    const file = new File([blob], 'gemini-video.mp4', { type: 'video/mp4' });
                    return navigator.share({
                        title: 'Gemini AI ile Oluşturulan Video',
                        text: 'Bu videoyu Gemini AI ile oluşturdum!',
                        files: [file]
                    });
                })
                .catch(error => {
                    console.log('Video paylaşma hatası:', error);
                    copyVideoToClipboard(videoData);
                });
        } else {
            copyVideoToClipboard(videoData);
        }
    };

    function copyVideoToClipboard(videoData) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>Oluşturulan Video</title></head>
                <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
                    <video src="${videoData}" controls style="max-width:100%; max-height:100vh;">
                        Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                </body>
            </html>
        `);
        
        showNotification('Video yeni sekmede açıldı');
    }

    // Video management functions
    window.deleteVideo = function(videoId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        if (confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
            const videoIndex = imageHistory.findIndex(item => item.id == videoId);
            if (videoIndex !== -1) {
                imageHistory.splice(videoIndex, 1);
            }
            
            const galleryItem = document.querySelector(`[data-video-id="${videoId}"]`);
            if (galleryItem) {
                galleryItem.style.transform = 'scale(0)';
                galleryItem.style.opacity = '0';
                
                setTimeout(() => {
                    galleryItem.remove();
                    
                    if (imageHistory.length === 0 && noResults) {
                        noResults.style.display = 'block';
                    }
                }, 300);
            }
            
            showNotification('Video başarıyla silindi');
        }
    };

    window.editVideo = function(videoId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        showNotification('Video düzenleme özelliği yakında eklenecek!', 'info');
    };

    window.saveVideo = function(videoId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        handlePageChange('create');
        showNotification('Video kaydetme özelliği yakında eklenecek!', 'info');
    };

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        // 5 saniye sonra hatayı gizle
        setTimeout(hideError, 5000);
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    // Show notification function
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Make showNotification globally accessible
    window.showNotification = showNotification;
    
    // Product Guide Function
    window.showProductGuide = function() {
        showNotification('Ürün oluşturma rehberi yakında eklenecek!', 'info');
    };

    // Product Save Functions
    const productSaveSection = document.getElementById('productSaveSection');
    const saveProductName = document.getElementById('saveProductName');
    const saveProductBtn = document.getElementById('saveProductBtn');

    let currentOriginalImagePath = null;
    let currentGeneratedImagePath = null;

    // Ürün kaydetme butonunu etkinleştir
    function enableProductSave() {
        if (productSaveSection) {
            productSaveSection.style.display = 'block';
        }
    }

    // Ürün kaydetme işlemi
    function saveProduct() {
        const name = saveProductName.value.trim();
        const description = saveProductDescription.value.trim();

        if (!name) {
            showNotification('Lütfen ürün adını girin', 'error');
            return;
        }

        if (imageHistory.length === 0) {
            showNotification('Kaydedilecek resim bulunamadı', 'error');
            return;
        }

        saveProductBtn.disabled = true;
        saveProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';

        // Çoklu görseli FormData ile gönder
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        console.log('DEBUG: imageHistory length:', imageHistory.length);
        console.log('DEBUG: imageHistory:', imageHistory);

        // Her görseli ekle
        imageHistory.forEach((img, idx) => {
            console.log(`DEBUG: Processing image ${idx}:`, img);
            if (img.isCustom && img.file) {
                // Kullanıcıdan yüklenen dosya
                console.log(`DEBUG: Adding custom file ${idx}:`, img.file);
                formData.append(`images`, img.file, `custom_${idx}.png`);
                formData.append(`image_types`, 'custom');
            } else if (img.type === 'video') {
                // Video dosyası - URL'den dosya adını çıkar
                console.log(`DEBUG: Adding video ${idx}:`, img.data);
                const videoUrl = img.data;
                const videoFilename = videoUrl.split('/').pop(); // URL'den dosya adını al
                formData.append(`video_path`, videoFilename);
                formData.append(`image_types`, 'video');
            } else if (img.data || img.dataUrl) {
                // AI ile üretilen görsel (base64) - hem 'data' hem 'dataUrl' kontrol et
                const imageData = img.data || img.dataUrl;
                console.log(`DEBUG: Adding generated image ${idx} from dataUrl`);
                // Base64'ü Blob'a çevirip dosya olarak ekle
                const arr = imageData.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                const file = new File([u8arr], `generated_${idx}.png`, { type: mime });
                formData.append(`images`, file);
                formData.append(`image_types`, 'generated');
            }
        });

        console.log('DEBUG: FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`DEBUG: ${key}:`, value);
        }

        fetch('/save_product_with_images', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Ürün başarıyla kaydedildi!', 'success');
                saveProductName.value = '';
                saveProductDescription.value = '';
                productSaveSection.style.display = 'none';
                if (currentPage === 'products') {
                    loadProducts();
                }
            } else {
                showNotification(data.error || 'Ürün kaydedilirken hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Save Product Error:', error);
            showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        })
        .finally(() => {
            saveProductBtn.disabled = false;
            saveProductBtn.innerHTML = '<i class="fas fa-save"></i> Ürünü Kaydet';
        });
    }

    // Event listeners for product save
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', saveProduct);
    }

    // Event listener for product description generation
    if (generateProductDescriptionBtn) {
        generateProductDescriptionBtn.addEventListener('click', generateProductDescription);
    }

    // Modal-specific functions
    window.closeProductDetailModal = function() {
        document.getElementById('productDetailModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        
        // Video oynatmayı durdur
        const modalVideo = document.getElementById('modalProductVideo');
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        
        // Clear current product
        currentEditingProduct = null;
        originalProductData = null;
        productImages = [];
        currentImageIndex = 0;
    };

    window.modalNavigateImage = function(direction) {
        if (productImages.length <= 1) return;
        
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) {
            currentImageIndex = productImages.length - 1;
        } else if (currentImageIndex >= productImages.length) {
            currentImageIndex = 0;
        }
        
        // Mevcut medya dosyasının türünü kontrol et
        const currentMedia = productImages[currentImageIndex];
        const isVideo = currentMedia && (currentMedia.toLowerCase().endsWith('.mp4') || 
                                        currentMedia.toLowerCase().endsWith('.avi') || 
                                        currentMedia.toLowerCase().endsWith('.mov') || 
                                        currentMedia.toLowerCase().endsWith('.wmv'));
        
        const modalImage = document.getElementById('modalProductImage');
        const modalVideo = document.getElementById('modalProductVideo');
        
        if (isVideo) {
            // Video göster
            modalImage.style.display = 'none';
            modalVideo.style.display = 'block';
            modalVideo.src = currentMedia;
        } else {
            // Resim göster
            modalImage.style.display = 'block';
            modalVideo.style.display = 'none';
            modalImage.src = currentMedia;
        }
        
        modalUpdateImageCounter();
        modalUpdateNavigationButtons();
    };

    window.modalUpdateImageCounter = function() {
        const modalCurrentImageIndex = document.getElementById('modalCurrentImageIndex');
        const modalTotalImages = document.getElementById('modalTotalImages');
        
        if (modalCurrentImageIndex) {
            modalCurrentImageIndex.textContent = currentImageIndex + 1;
        }
        if (modalTotalImages) {
            modalTotalImages.textContent = productImages.length;
        }
    };

    window.modalUpdateNavigationButtons = function() {
        const modalPrevBtn = document.querySelector('.modal-image-nav-prev');
        const modalNextBtn = document.querySelector('.modal-image-nav-next');
        
        if (modalPrevBtn) {
            modalPrevBtn.disabled = currentImageIndex === 0;
        }
        if (modalNextBtn) {
            modalNextBtn.disabled = currentImageIndex === productImages.length - 1;
        }
    };

    window.modalResetEditMode = function() {
        const modalEditModeBtn = document.getElementById('modalEditModeBtn');
        const modalSaveBtn = document.getElementById('modalSaveBtn');
        const modalCancelBtn = document.getElementById('modalCancelBtn');
        const modalProductNameInput = document.getElementById('modalProductNameInput');
        const modalProductDescInput = document.getElementById('modalProductDescInput');
        const modalProductPriceInput = document.getElementById('modalProductPriceInput');
        
        if (modalEditModeBtn) modalEditModeBtn.style.display = 'flex';
        if (modalSaveBtn) modalSaveBtn.style.display = 'none';
        if (modalCancelBtn) modalCancelBtn.style.display = 'none';
        
        if (modalProductNameInput) {
            modalProductNameInput.readOnly = true;
            modalProductNameInput.style.backgroundColor = '#f9fafb';
        }
        if (modalProductDescInput) {
            modalProductDescInput.readOnly = true;
            modalProductDescInput.style.backgroundColor = '#f9fafb';
        }
        if (modalProductPriceInput) {
            modalProductPriceInput.readOnly = true;
        }
    };

    window.modalToggleEditMode = function() {
        const modalEditModeBtn = document.getElementById('modalEditModeBtn');
        const modalSaveBtn = document.getElementById('modalSaveBtn');
        const modalCancelBtn = document.getElementById('modalCancelBtn');
        const modalProductNameInput = document.getElementById('modalProductNameInput');
        const modalProductDescInput = document.getElementById('modalProductDescInput');
        const modalProductPriceInput = document.getElementById('modalProductPriceInput');
        
        if (modalEditModeBtn.style.display === 'none') {
            // Switch to view mode
            modalEditModeBtn.style.display = 'flex';
            modalSaveBtn.style.display = 'none';
            modalCancelBtn.style.display = 'none';
            
            modalProductNameInput.readOnly = true;
            modalProductNameInput.style.backgroundColor = '#f9fafb';
            modalProductDescInput.readOnly = true;
            modalProductDescInput.style.backgroundColor = '#f9fafb';
            
            // Make price non-editable
            modalProductPriceInput.readOnly = true;
        } else {
            // Switch to edit mode
            modalEditModeBtn.style.display = 'none';
            modalSaveBtn.style.display = 'flex';
            modalCancelBtn.style.display = 'flex';
            
            modalProductNameInput.readOnly = false;
            modalProductNameInput.style.backgroundColor = '#ffffff';
            modalProductDescInput.readOnly = false;
            modalProductDescInput.style.backgroundColor = '#ffffff';
            
            // Make price editable
            modalProductPriceInput.readOnly = false;
            modalProductPriceInput.focus();
        }
    };

    window.modalSaveProductChanges = function() {
        if (!currentEditingProduct) {
            showNotification('Düzenlenecek ürün bulunamadı', 'error');
            return;
        }
        
        const modalProductNameInput = document.getElementById('modalProductNameInput');
        const modalProductDescInput = document.getElementById('modalProductDescInput');
        const modalProductPriceInput = document.getElementById('modalProductPriceInput');
        
        const newName = modalProductNameInput.value.trim();
        const newDescription = modalProductDescInput.value.trim();
        const newPrice = parseFloat(modalProductPriceInput.value) || 0;
        
        if (!newName) {
            showNotification('Ürün adı boş olamaz', 'error');
            return;
        }
        
        // Update the current product data
        currentEditingProduct.name = newName;
        currentEditingProduct.description = newDescription;
        currentEditingProduct.price = newPrice;
        
        // Send update request to backend
        const updateData = {
            product_id: currentEditingProduct.id,
            name: newName,
            description: newDescription,
            price: newPrice
        };
        
        fetch('/update_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Ürün başarıyla güncellendi!', 'success');
                modalToggleEditMode(); // Switch back to view mode
                
                // Update the original data
                originalProductData = { ...currentEditingProduct };
                
                // Refresh products list if on products page
                if (currentPage === 'products') {
                    loadProducts();
                }
            } else {
                showNotification(data.error || 'Ürün güncellenirken hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Update Product Error:', error);
            showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        });
    };

    window.modalCancelEdit = function() {
        if (!originalProductData) {
            showNotification('Orijinal ürün verisi bulunamadı', 'error');
            return;
        }
        
        const modalProductNameInput = document.getElementById('modalProductNameInput');
        const modalProductDescInput = document.getElementById('modalProductDescInput');
        const modalProductPriceInput = document.getElementById('modalProductPriceInput');
        
        // Restore original values
        modalProductNameInput.value = originalProductData.name;
        modalProductDescInput.value = originalProductData.description;
        
        // Restore original price
        if (modalProductPriceInput) {
            const originalPrice = originalProductData.price || 0;
            modalProductPriceInput.value = originalPrice;
        }
        
        // Update character count
        const modalDetailCharCount = document.getElementById('modalDetailCharCount');
        if (modalDetailCharCount) {
            modalDetailCharCount.textContent = `${originalProductData.description.length}/500 karakter`;
        }
        
        // Switch back to view mode
        modalToggleEditMode();
    };

    // Add event listener for modal character count
    const modalProductDescInput = document.getElementById('modalProductDescInput');
    if (modalProductDescInput) {
        modalProductDescInput.addEventListener('input', function() {
            const modalDetailCharCount = document.getElementById('modalDetailCharCount');
            if (modalDetailCharCount) {
                modalDetailCharCount.textContent = `${this.value.length}/500 karakter`;
            }
        });
    }

    // Add event listener for modal image upload overlay
    const modalImageUploadOverlay = document.getElementById('modalImageUploadOverlay');
    const modalDetailImageInput = document.getElementById('modalDetailImageInput');
    
    if (modalImageUploadOverlay && modalDetailImageInput) {
        modalImageUploadOverlay.addEventListener('click', function() {
            modalDetailImageInput.click();
        });
        
        modalDetailImageInput.addEventListener('change', function(event) {
            if (event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                if (isValidImageFile(file)) {
                    // Handle the image upload for modal
                    // This would need to be implemented based on your backend requirements
                    showNotification('Modal resim yükleme özelliği henüz tamamlanmadı', 'info');
                } else {
                    showNotification('Lütfen geçerli bir resim dosyası seçin', 'error');
                }
            }
        });
    }

    // Modal Action Button Functions

    window.addToTrendyol = function() {
        // Show green notification
        showNotification('Ürün Trendyol\'a eklendi', 'success');
    };

    window.viewOnTrendyol = function() {
        // Get current product data
        if (!currentEditingProduct) {
            showNotification('Ürün bilgisi bulunamadı', 'error');
            return;
        }
        
        // Get all product images for Trendyol page
        let productImagesForTrendyol = [];
        if (productImages && productImages.length > 0) {
            // Use the productImages array that contains all images for this product
            // Extract just the filename from the full path
            productImagesForTrendyol = productImages.map(imgPath => {
                // Remove /static/uploads/ prefix and return just the filename
                return imgPath.replace('/static/uploads/', '');
            });
        } else if (currentEditingProduct.all_images && currentEditingProduct.all_images.length > 0) {
            // Fallback to all_images from the product data
            productImagesForTrendyol = currentEditingProduct.all_images.map(img => img.path);
        } else if (currentEditingProduct.image) {
            // Fallback to single image - extract filename
            const imagePath = currentEditingProduct.image;
            productImagesForTrendyol = [imagePath.replace('/static/uploads/', '')];
        }
        
        // Get product price - try to get from product data, otherwise use default
        let productPrice = '299.99'; // Default price
        if (currentEditingProduct.price) {
            productPrice = currentEditingProduct.price.toString();
        }
        
        // Build URL parameters for Trendyol page
        const params = new URLSearchParams({
            name: currentEditingProduct.name || 'Ürün',
            description: currentEditingProduct.description || 'Ürün açıklaması',
            price: productPrice,
            angleImages: encodeURIComponent(JSON.stringify(productImagesForTrendyol)),
            category: 'Genel',
            material: 'Premium Materyal',
            color: 'Siyah',
            style: 'Modern',
            audience: 'Unisex'
        });
        
        // Open Trendyol page in a new window/tab
        const trendyolUrl = `/trendyol_product?${params.toString()}`;
        window.open(trendyolUrl, '_blank');
    };

    window.addToN11 = function() {
        // Show green notification
        showNotification('Ürün n11\'e eklendi', 'success');
    };

    window.viewOnN11 = function() {
    // Get current product data
    if (!currentEditingProduct) {
        showNotification('Ürün bilgisi bulunamadı', 'error');
        return;
    }
    
    // Get all product images for n11 page
    let productImagesForN11 = [];
    if (productImages && productImages.length > 0) {
        // Use the productImages array that contains all images for this product
        // Extract just the filename from the full path
        productImagesForN11 = productImages.map(imgPath => {
            // Remove /static/uploads/ prefix and return just the filename
            return imgPath.replace('/static/uploads/', '');
        });
    } else if (currentEditingProduct.all_images && currentEditingProduct.all_images.length > 0) {
        // Fallback to all_images from the product data
        productImagesForN11 = currentEditingProduct.all_images.map(img => img.path);
    } else if (currentEditingProduct.image) {
        // Fallback to single image - extract filename
        const imagePath = currentEditingProduct.image;
        productImagesForN11 = [imagePath.replace('/static/uploads/', '')];
    }
    
    // Get product price - try to get from product data, otherwise use default
    let productPrice = '299.99'; // Default price
    if (currentEditingProduct.price) {
        productPrice = currentEditingProduct.price.toString();
    }
    
    // Build URL parameters for n11 page
    const params = new URLSearchParams({
        name: currentEditingProduct.name || 'Ürün',
        description: currentEditingProduct.description || 'Ürün açıklaması',
        price: productPrice,
        angleImages: encodeURIComponent(JSON.stringify(productImagesForN11)),
        category: 'Genel',
        material: 'Premium Materyal',
        color: 'Siyah',
        style: 'Modern',
        audience: 'Unisex'
    });
    
    // Open n11 page in a new window/tab
    const n11Url = `/n11_product?${params.toString()}`;
    window.open(n11Url, '_blank');
};



    window.deleteProductFromModal = function() {
        if (!currentEditingProduct) {
            showNotification('Ürün bilgisi bulunamadı', 'error');
            return;
        }

        if (confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            // Close the modal first
            closeProductDetailModal();
            
            // Call the existing delete function
            deleteProductFromCard(currentEditingProduct.id);
        }
    };

    // Profile page functions
    window.loadProfileStats = function() {
        fetch('/get_profile_stats')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateProfileUI(data.user_info);
                } else {
                    console.error('Profil bilgileri alınamadı:', data.error);
                }
            })
            .catch(error => {
                console.error('Profil bilgileri yüklenirken hata:', error);
            });
    };

    function updateProfileUI(userInfo) {
        // Update username
        const usernameElement = document.getElementById('profileUsername');
        if (usernameElement) {
            usernameElement.textContent = userInfo.username;
        }

        // Update email
        const emailElement = document.getElementById('profileEmail');
        if (emailElement) {
            emailElement.textContent = userInfo.email;
        }

        // Update stats
        const totalProductsElement = document.getElementById('profileTotalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = userInfo.total_products;
        }

        const totalImagesElement = document.getElementById('profileTotalImages');
        if (totalImagesElement) {
            totalImagesElement.textContent = userInfo.total_images;
        }

        const totalVideosElement = document.getElementById('profileTotalVideos');
        if (totalVideosElement) {
            totalVideosElement.textContent = userInfo.total_videos;
        }
    }

    window.showAdvancedTips = function() {
        // Create and show advanced tips modal
        const modal = document.createElement('div');
        modal.className = 'advanced-tips-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closeAdvancedTips()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-star"></i> Gelişmiş İpuçları</h3>
                    <button class="modal-close" onclick="closeAdvancedTips()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="tip-category">
                        <h4><i class="fas fa-lightbulb"></i> Prompt Yazma İpuçları</h4>
                        <ul>
                            <li>Spesifik olun: "Modern ofis ortamında, profesyonel görünüm"</li>
                            <li>Renk belirtin: "Beyaz arka plan, doğal ışık"</li>
                            <li>Stil ekleyin: "Minimalist tasarım, temiz kompozisyon"</li>
                            <li>Açı belirtin: "45 derece açıdan, dinamik poz"</li>
                        </ul>
                    </div>
                    <div class="tip-category">
                        <h4><i class="fas fa-camera"></i> Fotoğraf Kalitesi</h4>
                        <ul>
                            <li>Yüksek çözünürlüklü fotoğraflar kullanın (en az 1000x1000px)</li>
                            <li>İyi aydınlatılmış ortamda çekim yapın</li>
                            <li>Arka planı temiz tutun</li>
                            <li>Ürünü merkeze alın</li>
                        </ul>
                    </div>
                    <div class="tip-category">
                        <h4><i class="fas fa-chart-line"></i> E-ticaret Optimizasyonu</h4>
                        <ul>
                            <li>SEO anahtar kelimeleri ürün açıklamasına dahil edin</li>
                            <li>Farklı açılardan görseller oluşturun</li>
                            <li>Platform özelinde optimize edin</li>
                            <li>Düzenli olarak içerik güncelleyin</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add CSS for the modal
        const style = document.createElement('style');
        style.textContent = `
            .advanced-tips-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .advanced-tips-modal .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            .advanced-tips-modal .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                z-index: 1001;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            .advanced-tips-modal .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .advanced-tips-modal .modal-header h3 {
                margin: 0;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .advanced-tips-modal .modal-close {
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.2s;
            }
            .advanced-tips-modal .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            .advanced-tips-modal .modal-body {
                padding: 1.5rem;
            }
            .tip-category {
                margin-bottom: 2rem;
            }
            .tip-category h4 {
                color: #1f2937;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .tip-category ul {
                list-style: none;
                padding: 0;
            }
            .tip-category li {
                padding: 0.5rem 0;
                color: #4b5563;
                position: relative;
                padding-left: 1.5rem;
            }
            .tip-category li:before {
                content: "•";
                color: #3b82f6;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
        `;
        document.head.appendChild(style);
    };

    window.closeAdvancedTips = function() {
        const modal = document.querySelector('.advanced-tips-modal');
        if (modal) {
            modal.remove();
        }
    };

});