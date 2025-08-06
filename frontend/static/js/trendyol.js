// Trendyol Product Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeProductPage();
    initializeSizeSelection();
    initializeColorSelection();
    initializeQuantityControls();
    initializeTabs();
    initializeProductData();
    initializeScrollToTop();
});

// Product Page Initialization
function initializeProductPage() {
    console.log('Trendyol product page initialized');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name') || 'Premium Spor Ayakkabı';
    const productDescription = urlParams.get('description') || 'Premium kalitede spor ayakkabı. Rahat ve şık tasarım.';
    const productPrice = parseFloat(urlParams.get('price')) || 299.99;
    const productAngles = parseInt(urlParams.get('angles')) || 1;
    const productId = urlParams.get('productId') || 'trendyol-product-001';
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

// Enhanced Thumbnail Navigation with Video Support and Smooth Scrolling
function initializeThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainProductImage');
    const mainVideo = document.getElementById('mainProductVideo');
    const thumbnailContainer = document.querySelector('.thumbnail-images');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image or video
            const media = window.productData.images[index];
            if (media) {
                const isVideo = media && (media.toLowerCase().endsWith('.mp4') || 
                                         media.toLowerCase().endsWith('.avi') || 
                                         media.toLowerCase().endsWith('.mov') || 
                                         media.toLowerCase().endsWith('.wmv'));
                
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
            }
            
            // Smooth scroll thumbnail into view if needed
            if (thumbnailContainer) {
                const containerWidth = thumbnailContainer.offsetWidth;
                const thumbnailWidth = thumbnail.offsetWidth;
                const thumbnailLeft = thumbnail.offsetLeft;
                const scrollLeft = thumbnailContainer.scrollLeft;
                
                // Check if thumbnail is partially or fully hidden
                if (thumbnailLeft < scrollLeft || thumbnailLeft + thumbnailWidth > scrollLeft + containerWidth) {
                    thumbnailContainer.scrollTo({
                        left: thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Size Selection
function initializeSizeSelection() {
    const sizeOptions = document.querySelectorAll('.size-option');
    
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all size options
            sizeOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update selected size
            const selectedSize = this.getAttribute('data-size');
            window.productData.selectedSize = selectedSize;
            
            // Update UI to show size is selected
            updateSizeSelection(selectedSize);
        });
    });
}

function updateSizeSelection(size) {
    console.log(`Size selected: ${size}`);
    
    // You can add additional logic here like:
    // - Checking stock availability
    // - Updating price if different sizes have different prices
    // - Showing size guide
}

// Color Selection
function initializeColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all color options
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update selected color
            const selectedColor = this.getAttribute('data-color');
            window.productData.selectedColor = selectedColor;
            
            // Update UI to show color is selected
            updateColorSelection(selectedColor);
        });
    });
}

function updateColorSelection(color) {
    console.log(`Color selected: ${color}`);
    
    // You can add additional logic here like:
    // - Changing product images based on color
    // - Updating price if different colors have different prices
    // - Showing color-specific information
}

// Quantity Controls
function initializeQuantityControls() {
    const quantityInput = document.querySelector('.quantity-input');
    const minusBtn = document.querySelector('.quantity-btn:first-child');
    const plusBtn = document.querySelector('.quantity-btn:last-child');
    
    if (quantityInput && minusBtn && plusBtn) {
        // Set initial value
        quantityInput.value = window.productData.quantity;
        
        // Minus button
        minusBtn.addEventListener('click', function() {
            changeQuantity(-1);
        });
        
        // Plus button
        plusBtn.addEventListener('click', function() {
            changeQuantity(1);
        });
        
        // Input change
        quantityInput.addEventListener('change', function() {
            const newQuantity = parseInt(this.value);
            if (newQuantity >= 1 && newQuantity <= 10) {
                window.productData.quantity = newQuantity;
            } else {
                this.value = window.productData.quantity;
            }
        });
    }
}

function changeQuantity(delta) {
    const quantityInput = document.querySelector('.quantity-input');
    if (!quantityInput) return;
    
    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + delta;
    
    // Ensure quantity is between 1 and 10
    newQuantity = Math.max(1, Math.min(10, newQuantity));
    
    quantityInput.value = newQuantity;
    window.productData.quantity = newQuantity;
    
    console.log(`Quantity changed to: ${newQuantity}`);
}

// Enhanced Tab System with Smooth Scrolling
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabContainer = document.querySelector('.details-tabs');
    
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
            
            // Smooth scroll tab into view if needed
            if (tabContainer) {
                const containerWidth = tabContainer.offsetWidth;
                const buttonWidth = this.offsetWidth;
                const buttonLeft = this.offsetLeft;
                const scrollLeft = tabContainer.scrollLeft;
                
                // Check if button is partially or fully hidden
                if (buttonLeft < scrollLeft || buttonLeft + buttonWidth > scrollLeft + containerWidth) {
                    tabContainer.scrollTo({
                        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Initialize Product Data
function initializeProductData() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Update product data with URL parameters if available
    if (urlParams.has('name')) {
        window.productData.name = urlParams.get('name');
    }
    if (urlParams.has('price')) {
        window.productData.price = parseFloat(urlParams.get('price'));
    }
    if (urlParams.has('description')) {
        window.productData.description = urlParams.get('description');
        window.productData.detailedDescription = urlParams.get('description');
    }
    if (urlParams.has('image')) {
        const imageUrl = urlParams.get('image');
        window.productData.images = [imageUrl, imageUrl, imageUrl]; // Use same image for all thumbnails
    }
    if (urlParams.has('category')) {
        window.productData.specifications.style = urlParams.get('category');
    }
    if (urlParams.has('material')) {
        window.productData.specifications.material = urlParams.get('material');
    }
    if (urlParams.has('color')) {
        window.productData.specifications.color = urlParams.get('color');
        window.productData.selectedColor = urlParams.get('color').toLowerCase();
    }
    if (urlParams.has('style')) {
        window.productData.specifications.style = urlParams.get('style');
    }
    if (urlParams.has('audience')) {
        window.productData.specifications.audience = urlParams.get('audience');
    }
    
    // Set product title
    const productTitle = document.getElementById('productTitle');
    if (productTitle) {
        productTitle.textContent = window.productData.name;
    }
    
    // Set product price
    const productPrice = document.getElementById('productPrice');
    if (productPrice) {
        productPrice.textContent = `${window.productData.currency}${window.productData.price}`;
    }
    
    // Set product description
    const productDescription = document.getElementById('productDescription');
    if (productDescription) {
        productDescription.innerHTML = `<p>${window.productData.description}</p>`;
    }
    
    // Set detailed description
    const detailedDescription = document.getElementById('detailedDescription');
    if (detailedDescription) {
        detailedDescription.innerHTML = `<p>${window.productData.detailedDescription}</p>`;
    }
    
    // Set specifications
    const specs = window.productData.specifications;
    if (specs) {
        const specMaterial = document.getElementById('specMaterial');
        const specColor = document.getElementById('specColor');
        const specStyle = document.getElementById('specStyle');
        const specAudience = document.getElementById('specAudience');
        
        if (specMaterial) specMaterial.textContent = specs.material;
        if (specColor) specColor.textContent = specs.color;
        if (specStyle) specStyle.textContent = specs.style;
        if (specAudience) specAudience.textContent = specs.audience;
    }
    
    // Set breadcrumb
    const productNameBreadcrumb = document.getElementById('productNameBreadcrumb');
    if (productNameBreadcrumb) {
        productNameBreadcrumb.textContent = window.productData.name;
    }
    
    // Set category breadcrumb
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    if (categoryBreadcrumb) {
        categoryBreadcrumb.textContent = specs?.style || 'Kategori';
    }
    
    // Set main image or video
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
    
    // Dynamically create thumbnails based on actual images
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
        
        window.productData.images.forEach((media, index) => {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            
            const isVideo = media && (media.toLowerCase().endsWith('.mp4') || 
                                     media.toLowerCase().endsWith('.avi') || 
                                     media.toLowerCase().endsWith('.mov') || 
                                     media.toLowerCase().endsWith('.wmv'));
            
            if (isVideo) {
                thumbnailDiv.innerHTML = `
                    <video src="${media}" alt="${window.productData.name} - Video ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="video-badge">Video</div>
                    </video>
                `;
            } else {
                thumbnailDiv.innerHTML = `
                    <img src="${media}" alt="${window.productData.name} - Görsel ${index + 1}">
                `;
            }
            
            thumbnailContainer.appendChild(thumbnailDiv);
        });
        
        // Re-initialize thumbnail functionality
        initializeThumbnails();
    }
    
    // Update color selection if color is provided
    if (window.productData.selectedColor) {
        updateColorSelection(window.productData.selectedColor);
    }
    
    console.log('Product data initialized with:', window.productData);
}

// Cart Functionality
function addToCart() {
    const { selectedSize, selectedColor, quantity, name, price } = window.productData;
    
    if (!selectedSize) {
        showNotification('Lütfen bir beden seçin', 'error');
        return;
    }
    
    if (!selectedColor) {
        showNotification('Lütfen bir renk seçin', 'error');
        return;
    }
    
    // Create cart item
    const cartItem = {
        productId: window.productData.id,
        name: name,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        price: price,
        total: price * quantity
    };
    
    // Add to cart (you can implement actual cart storage here)
    console.log('Adding to cart:', cartItem);
    
    // Show success message
    showNotification('Ürün sepete eklendi!', 'success');
    
    // Update cart count in header
    updateCartCount();
}

function buyNow() {
    const { selectedSize, selectedColor, quantity, name, price } = window.productData;
    
    if (!selectedSize) {
        showNotification('Lütfen bir beden seçin', 'error');
        return;
    }
    
    if (!selectedColor) {
        showNotification('Lütfen bir renk seçin', 'error');
        return;
    }
    
    // Add to cart first
    addToCart();
    
    // Then redirect to checkout
    setTimeout(() => {
        alert('Ödeme sayfasına yönlendiriliyorsunuz...');
        // window.location.href = '/checkout';
    }, 1000);
}

function updateCartCount() {
    // You can implement actual cart count update here
    const cartLink = document.querySelector('.menu-item[href="#"]');
    if (cartLink) {
        const span = cartLink.querySelector('span');
        if (span) {
            // For demo purposes, just show a number
            span.textContent = 'Sepetim (1)';
        }
    }
}

// Add Product to Trendyol Function
function addProductToTrendyol() {
    // Get product data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    
    // Ensure price is correctly retrieved
    let productPrice = urlParams.get('price');
    if (productPrice) {
        productPrice = parseFloat(productPrice);
    } else {
        productPrice = window.productData?.price || 299;
    }
    
    const productData = {
        name: urlParams.get('name') || window.productData.name,
        price: productPrice,
        description: urlParams.get('description') || window.productData.description,
        image: urlParams.get('image') || window.productData.images[0],
        category: urlParams.get('category') || 'Spor Ayakkabı',
        material: urlParams.get('material') || window.productData.specifications.material,
        color: urlParams.get('color') || window.productData.specifications.color,
        style: urlParams.get('style') || window.productData.specifications.style,
        audience: urlParams.get('audience') || window.productData.specifications.audience
    };
    
    // Update the page with the new product data
    updateProductPage(productData);
    
    // Show success message
    showNotification(`Ürün ${productPrice} TL fiyatıyla Trendyol sayfasına eklendi!`, 'success');
    
    // Log the action
    console.log('Product added to Trendyol with price:', productData);
}

function updateProductPage(productData) {
    console.log('Updating Trendyol page with data:', productData);
    
    // Update product title
    const productTitle = document.getElementById('productTitle');
    if (productTitle) {
        productTitle.textContent = productData.name;
    }
    
    // Update product price
    const productPrice = document.getElementById('productPrice');
    if (productPrice && productData.price) {
        // Ensure price is formatted correctly
        const formattedPrice = Number(productData.price).toFixed(0);
        productPrice.textContent = `₺${formattedPrice}`;
        console.log('Price updated to:', formattedPrice);
    }
    
    // Update product description
    const productDescription = document.getElementById('productDescription');
    if (productDescription) {
        productDescription.innerHTML = `<p>${productData.description}</p>`;
    }
    
    // Update detailed description
    const detailedDescription = document.getElementById('detailedDescription');
    if (detailedDescription) {
        detailedDescription.innerHTML = `<p>${productData.description}</p>`;
    }
    
    // Update specifications
    const specMaterial = document.getElementById('specMaterial');
    const specColor = document.getElementById('specColor');
    const specStyle = document.getElementById('specStyle');
    const specAudience = document.getElementById('specAudience');
    const specAngles = document.getElementById('specAngles');
    
    if (specMaterial) specMaterial.textContent = productData.material;
    if (specColor) specColor.textContent = productData.color;
    if (specStyle) specStyle.textContent = productData.style;
    if (specAudience) specAudience.textContent = productData.audience;
    if (specAngles && productData.angles) specAngles.textContent = `${productData.angles} Farklı Açı`;
    
    // Update breadcrumb
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const productNameBreadcrumb = document.getElementById('productNameBreadcrumb');
    
    if (categoryBreadcrumb) categoryBreadcrumb.textContent = productData.category;
    if (productNameBreadcrumb) productNameBreadcrumb.textContent = productData.name;
    
    // Update main image if provided
    if (productData.image) {
        const mainImage = document.getElementById('mainProductImage');
        const thumbnail1 = document.getElementById('thumbnail1');
        
        if (mainImage) mainImage.src = productData.image;
        if (thumbnail1) thumbnail1.src = productData.image;
    }
    
    // Update thumbnails if images are provided
    if (productData.images && Array.isArray(productData.images)) {
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
            
            productData.images.forEach((image, index) => {
                const thumbnailDiv = document.createElement('div');
                thumbnailDiv.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                thumbnailDiv.innerHTML = `
                    <img src="${image}" alt="${productData.name} - Görsel ${index + 1}">
                `;
                thumbnailContainer.appendChild(thumbnailDiv);
            });
            
            // Re-initialize thumbnail functionality
            initializeThumbnails();
        }
    }
    
    // Show multiple angles badge if more than 1 angle
    if (productData.angles && productData.angles > 1) {
        const productBadge = document.querySelector('.product-badge');
        if (productBadge) {
            // Remove existing angles badge if any
            const existingBadge = productBadge.querySelector('.angles-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            const anglesBadge = document.createElement('span');
            anglesBadge.className = 'badge angles-badge';
            anglesBadge.innerHTML = `<i class="fas fa-cube"></i> ${productData.angles} Açı`;
            productBadge.appendChild(anglesBadge);
        }
    }
    
    // Update window.productData
    window.productData.name = productData.name;
    window.productData.price = productData.price;
    window.productData.description = productData.description;
    window.productData.angles = productData.angles;
    window.productData.specifications = {
        material: productData.material,
        color: productData.color,
        style: productData.style,
        audience: productData.audience,
        angles: productData.angles ? `${productData.angles} Farklı Açı` : null
    };
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

// Scroll to Top Functionality
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    // Show/hide scroll to top button based on scroll position
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

// Export functions for global access
window.addToCart = addToCart;
window.buyNow = buyNow;
window.changeQuantity = changeQuantity;
window.addProductToTrendyol = addProductToTrendyol;
window.showNotification = showNotification; 
window.scrollToTop = scrollToTop; 