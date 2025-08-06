// n11 Product Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeProductPage();
    initializeThumbnails();
    initializeSizeSelection();
    initializeColorSelection();
    initializeQuantityControls();
    initializeTabs();
    initializeProductData();
    initializeScrollToTop();
});

// Product Page Initialization
function initializeProductPage() {
    console.log('n11 product page initialized');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name') || 'Premium Spor Ayakkabı';
    const productDescription = urlParams.get('description') || 'Premium kalitede spor ayakkabı. Rahat ve şık tasarım.';
    const productPrice = parseFloat(urlParams.get('price')) || 299.99;
    const productAngles = parseInt(urlParams.get('angles')) || 1;
    const productId = urlParams.get('productId') || 'n11-product-001';
    const angleImages = urlParams.get('angleImages') || '';
    
    // Parse angle images if provided
    let images = [
        'https://via.placeholder.com/600x800/ffffff/cccccc?text=Ön+Görünüm',
        'https://via.placeholder.com/600x800/ffffff/cccccc?text=Yan+Görünüm',
        'https://via.placeholder.com/600x800/ffffff/cccccc?text=Arka+Görünüm'
    ];
    
    console.log('Angle images from URL:', angleImages);
    
    if (angleImages) {
        try {
            const parsedImages = JSON.parse(decodeURIComponent(angleImages));
            console.log('Parsed angle images:', parsedImages);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                images = parsedImages.map(img => `/static/uploads/${img}`);
                console.log('Final images array:', images);
            }
        } catch (e) {
            console.error('Error parsing angle images:', e);
        }
    }
    
    // Set up product data
    window.productData = {
        id: productId,
        name: productName,
        price: productPrice,
        currency: '₺',
        angles: productAngles,
        images: images,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
            { name: 'siyah', hex: '#000000' },
            { name: 'beyaz', hex: '#ffffff' },
            { name: 'mavi', hex: '#0066cc' }
        ],
        selectedSize: 'M',
        selectedColor: 'siyah',
        quantity: 1,
        description: productDescription,
        detailedDescription: `${productDescription} Bu ürün ${productAngles} farklı açıdan görüntülenebilir. Her açı, ürünün farklı özelliklerini ve detaylarını gösterir.`,
        specifications: {
            material: 'Premium Tekstil',
            color: 'Siyah',
            style: 'Spor Ayakkabı',
            audience: 'Unisex',
            angles: `${productAngles} Farklı Açı`
        }
    };
}

// Thumbnail Navigation
function initializeThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainProductImage');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image
            if (mainImage && window.productData.images[index]) {
                mainImage.src = window.productData.images[index];
                mainImage.alt = `${window.productData.name} - Görsel ${index + 1}`;
            }
        });
    });
}

// Size Selection
function initializeSizeSelection() {
    const sizeOptions = document.querySelectorAll('.size-option');
    
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            updateSizeSelection(size);
        });
    });
}

function updateSizeSelection(size) {
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => option.classList.remove('active'));
    
    const selectedOption = document.querySelector(`[data-size="${size}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
        window.productData.selectedSize = size;
    }
}

// Color Selection
function initializeColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            updateColorSelection(color);
        });
    });
}

function updateColorSelection(color) {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('active'));
    
    const selectedOption = document.querySelector(`[data-color="${color}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
        window.productData.selectedColor = color;
    }
}

// Quantity Controls
function initializeQuantityControls() {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value >= 1 && value <= 10) {
                window.productData.quantity = value;
            } else {
                this.value = window.productData.quantity;
            }
        });
    }
}

function changeQuantity(delta) {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        let newValue = currentValue + delta;
        
        if (newValue >= 1 && newValue <= 10) {
            quantityInput.value = newValue;
            window.productData.quantity = newValue;
        }
    }
}

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Product Data Initialization
function initializeProductData() {
    if (!window.productData) {
        console.error('Product data not initialized');
        return;
    }
    
    // Update product title
    const productTitle = document.getElementById('productTitle');
    if (productTitle) {
        productTitle.textContent = window.productData.name;
    }
    
    // Update breadcrumb
    const productNameBreadcrumb = document.getElementById('productNameBreadcrumb');
    if (productNameBreadcrumb) {
        productNameBreadcrumb.textContent = window.productData.name;
    }
    
    // Update product price
    const productPrice = document.getElementById('productPrice');
    if (productPrice) {
        productPrice.textContent = `${window.productData.currency}${window.productData.price.toFixed(2)}`;
    }
    
    // Update product description
    const productDescription = document.getElementById('productDescription');
    if (productDescription) {
        productDescription.innerHTML = `<p>${window.productData.description}</p>`;
    }
    
    // Update detailed description
    const detailedDescription = document.getElementById('detailedDescription');
    if (detailedDescription) {
        detailedDescription.innerHTML = `<p>${window.productData.detailedDescription}</p>`;
    }
    
    // Update specifications
    const specMaterial = document.getElementById('specMaterial');
    const specColor = document.getElementById('specColor');
    const specStyle = document.getElementById('specStyle');
    const specAudience = document.getElementById('specAudience');
    const specAngles = document.getElementById('specAngles');
    
    if (specMaterial) specMaterial.textContent = window.productData.specifications.material;
    if (specColor) specColor.textContent = window.productData.specifications.color;
    if (specStyle) specStyle.textContent = window.productData.specifications.style;
    if (specAudience) specAudience.textContent = window.productData.specifications.audience;
    if (specAngles) specAngles.textContent = window.productData.specifications.angles;
    
    // Update main image or video
    const mainImage = document.getElementById('mainProductImage');
    const mainVideo = document.getElementById('mainProductVideo');
    if (window.productData.images.length > 0) {
        const firstMedia = window.productData.images[0];
        const isVideo = firstMedia && (firstMedia.toLowerCase().endsWith('.mp4') || 
                                      firstMedia.toLowerCase().endsWith('.avi') || 
                                      firstMedia.toLowerCase().endsWith('.mov') || 
                                      firstMedia.toLowerCase().endsWith('.wmv'));
        
        if (isVideo) {
            // Show video
            if (mainImage) mainImage.style.display = 'none';
            if (mainVideo) {
                mainVideo.style.display = 'block';
                mainVideo.src = firstMedia;
            }
        } else {
            // Show image
            if (mainImage) {
                mainImage.style.display = 'block';
                mainImage.src = firstMedia;
                mainImage.alt = window.productData.name;
            }
            if (mainVideo) mainVideo.style.display = 'none';
        }
    }
    
    // Generate thumbnails
    generateThumbnails();
    
    // Add multiple angles badge if needed
    if (window.productData.angles > 1) {
        addMultipleAnglesBadge();
    }
}

// Generate Thumbnails
function generateThumbnails() {
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    if (!thumbnailContainer || !window.productData.images) return;
    
    thumbnailContainer.innerHTML = '';
    
    window.productData.images.forEach((media, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        
        const isVideo = media && (media.toLowerCase().endsWith('.mp4') || 
                                 media.toLowerCase().endsWith('.avi') || 
                                 media.toLowerCase().endsWith('.mov') || 
                                 media.toLowerCase().endsWith('.wmv'));
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = media;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.alt = `${window.productData.name} - Video ${index + 1}`;
            
            // Add video badge
            const videoBadge = document.createElement('div');
            videoBadge.className = 'video-badge';
            videoBadge.textContent = 'Video';
            videoBadge.style.position = 'absolute';
            videoBadge.style.top = '5px';
            videoBadge.style.right = '5px';
            videoBadge.style.background = 'rgba(0,0,0,0.7)';
            videoBadge.style.color = 'white';
            videoBadge.style.padding = '2px 6px';
            videoBadge.style.borderRadius = '3px';
            videoBadge.style.fontSize = '10px';
            
            thumbnail.appendChild(video);
            thumbnail.appendChild(videoBadge);
        } else {
            const img = document.createElement('img');
            img.src = media;
            img.alt = `${window.productData.name} - Görsel ${index + 1}`;
            thumbnail.appendChild(img);
        }
        
        thumbnailContainer.appendChild(thumbnail);
        
        // Add click event
        thumbnail.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const mainImage = document.getElementById('mainProductImage');
            const mainVideo = document.getElementById('mainProductVideo');
            
            if (isVideo) {
                // Show video
                if (mainImage) mainImage.style.display = 'none';
                if (mainVideo) {
                    mainVideo.style.display = 'block';
                    mainVideo.src = media;
                }
            } else {
                // Show image
                if (mainImage) {
                    mainImage.style.display = 'block';
                    mainImage.src = media;
                    mainImage.alt = `${window.productData.name} - Görsel ${index + 1}`;
                }
                if (mainVideo) mainVideo.style.display = 'none';
            }
        });
    });
}

// Add Multiple Angles Badge
function addMultipleAnglesBadge() {
    const mainImageContainer = document.querySelector('.main-image-container');
    if (!mainImageContainer) return;
    
    const badge = document.createElement('div');
    badge.className = 'angles-badge';
    badge.innerHTML = `
        <i class="fas fa-images"></i>
        ${window.productData.angles} Açı
    `;
    
    mainImageContainer.appendChild(badge);
}

// Cart Functions
function addToCart() {
    const cartItem = {
        id: window.productData.id,
        name: window.productData.name,
        price: window.productData.price,
        size: window.productData.selectedSize,
        color: window.productData.selectedColor,
        quantity: window.productData.quantity,
        image: window.productData.images[0]
    };
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('n11Cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.size === cartItem.size && 
        item.color === cartItem.color
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += cartItem.quantity;
    } else {
        // Add new item
        cart.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('n11Cart', JSON.stringify(cart));
    
    // Show notification
    showNotification('Ürün sepete eklendi!', 'success');
    
    // Update cart count
    updateCartCount();
}

function buyNow() {
    // Add to cart first
    addToCart();
    
    // Show notification
    showNotification('Satın alma işlemi başlatılıyor...', 'info');
    
    // Simulate redirect to checkout
    setTimeout(() => {
        showNotification('Ödeme sayfasına yönlendiriliyorsunuz...', 'info');
    }, 1000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('n11Cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart icon if exists
    const cartIcon = document.querySelector('.menu-item i.fa-shopping-cart');
    if (cartIcon) {
        const cartCount = cartIcon.parentElement.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }
}

// Add Product to n11
function addProductToN11() {
    const productData = {
        name: window.productData.name,
        price: window.productData.price,
        description: window.productData.description,
        images: window.productData.images,
        specifications: window.productData.specifications
    };
    
    // Show success notification
    showNotification('Ürün n11\'e başarıyla eklendi!', 'success');
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Ürün n11 mağazanızda yayınlandı!', 'success');
    }, 2000);
}

// Update Product Page
function updateProductPage(productData) {
    if (!productData) return;
    
    // Update product data
    window.productData = { ...window.productData, ...productData };
    
    // Re-initialize product data
    initializeProductData();
    
    // Show notification
    showNotification('Ürün bilgileri güncellendi!', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#ff6000';
    }
}

// Scroll to Top
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(255,255,255,0.2);
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 