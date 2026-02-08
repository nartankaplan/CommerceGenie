<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.0%20Flash-orange.svg)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**CommerceGenie E-commerce Store Automation**

[🚀 Get Started](#-installation-and-running) • [📖 Documentation](#-project-features) • [🤖 AI Features](#-ai-features) • [🛍️ E-commerce](#-e-commerce-integration)

</div>

---

## 📋 About the Project
Demo video: https://youtu.be/HbwP0CutjGI?si=Im2ju37xCHxmPx37

Developers: Nartan Kaplan, Muhammet Furkan Çam

CommerceGenie by ByteBrothers (Nartan Kaplan, Muhammet Furkan Çam)

🧠 What is CommerceGenie?

CommerceGenie is an AI-powered automation platform that completely redefines content production processes for e-commerce stores.

In today’s e-commerce world, it is not enough for a product to be high quality — how it is presented, described, and visualized plays a decisive role in sales success.

However, creating this presentation involves:

📸 Taking professional product photos,

🎬 Producing promotional videos,

📝 Writing original and SEO-friendly descriptions,

which are high-cost and time-consuming steps.

Moreover, each platform (Trendyol, N11, Shopify…) requires different formats, image sizes, and description criteria.

________________________________________

🚩 This Is Where CommerceGenie Comes In

CommerceGenie offers a solution that automatically performs all these content production processes on a single platform within minutes.

👤 The store owner simply uploads a product image and writes what they want:

“White background, show with a female model, prepare the description.”

If desired, this process can be fully automated, allowing the product to be created from the uploaded product image into new images, videos, and detailed product descriptions without pressing a single key on the keyboard, and then published on desired platforms.

📦 At this point, CommerceGenie:

• Analyzes the product with artificial intelligence  
• Re-edits the photo  
• Creates a promotional video  
• Automatically writes the product description  
• Prepares the Trendyol or N11 product page  

And does all of this without human intervention, at 90% lower cost compared to traditional methods.

________________________________________

🎯 In Summary

CommerceGenie targets three core problems faced by every seller today:

1. Lack of time and budget for content production  
2. Marketing materials not being at a professional level  
3. The necessity to create platform-specific content  

And offers a fast, economical, and user-friendly AI-powered solution to these problems.

This project is a comprehensive **e-commerce automation system** developed using **Google Gemini AI** technology. Store administrators can upload product images and, using text-based instructions, ask the AI to analyze and modify showcase images, videos, and product descriptions. Product catalog images, videos, and detailed product descriptions can be generated. The generated products can then be published on the store’s desired platforms through the automation system.

In this way, store owners save both time and costs related to product promotion and shooting expenses (model fees, studio costs, technical expenses, etc.).

### 🎯 Core Features

- **🤖 AI-Powered Visual Manipulation**: Advanced image analysis, editing, and generation with Gemini 2.0 Flash  
- **🎬 Video Generation**: Video creation using Gemini Veo-3  
- **📱 Modern Web Interface**: Responsive and user-friendly design  
- **🛍️ Product Management System**: Comprehensive product catalog and detail pages  
- **🔐 Secure User System**: Encrypted account management  
- **📊 E-commerce Integration**: Custom page designs for Trendyol and N11  

---

## ✨ Project Features

### 🤖 AI Features

#### 🖼️ Image Analysis and Editing
- **Automatic Image Analysis**: AI-based analysis of uploaded images  
- **Text-Based Editing**: Image manipulation using natural language  
- **Smart Description Generation**: Automatic description generation for images  
- **Product Feature Extraction**: Automatic detection of product features from images  

#### 🎬 Video Generation
- **AI Video Creation**: Dynamic video generation from images  
- **Dynamic Model Movements**: Models move within videos for product promotion  
- **Customizable Effects**: Various video effects and animations  

#### 📝 Content Generation
- **Product Descriptions**: Automatic product description generation  

### 🛍️ Product Management

#### 📦 Product Catalog
- **Grid Layout**: Modern and organized product display  
- **Multiple Image Support**: Multiple images per product  
- **Categorization**: Organizing products into categories  
- **Search and Filtering**: Advanced search features  

#### 📋 Product Detail Pages
- **Comprehensive Information**: Detailed product descriptions  
- **Gallery View**: Image gallery and lightbox  
- **Price Management**: Dynamic price updates  

#### 🔧 Product Operations
- **Add Product**: Create new products  
- **Edit Product**: Update existing products  
- **Delete Product**: Secure product removal  
- **Bulk Operations**: Multi-product management  

### 🎨 E-commerce Integration

#### 🟠 Trendyol Integration
- **Trendyol Design**: Trendyol-like product page  
- **Seller Information**: Detailed seller profile  
- **Rating System**: User reviews and ratings  
- **Price Comparison**: Competitor price analysis  

#### 🔵 N11 Integration
- **N11 Design**: N11-like product page  
- **Variant Management**: Product variants and options  
- **Stock Status**: Real-time stock information  
- **Delivery Information**: Shipping and delivery options  

### 🔐 Security and User Management

#### 👤 User System
- **Secure Registration/Login**: Encrypted account management  
- **Password Hashing**: Secure password storage  
- **Session Management**: Secure sessions with Flask-Login  
- **Profile Management**: User profile pages  

#### 🛡️ Security Measures
- **File Security**: Secure file upload and validation  
- **CSRF Protection**: Cross-site request forgery protection  
- **Input Validation**: User input validation  
- **File Size Limit**: Maximum file size of 16MB  

### 📱 User Interface

#### 🎨 Modern Design
- **Responsive Layout**: Compatible with all devices  
- **Dark/Light Theme**: Theme based on user preference  
- **Smooth Animations**: Modern transition effects  
- **Custom Scrollbar**: Customized scrollbar  

#### 🖱️ User Experience
- **Drag & Drop**: Intuitive file upload  
- **Real-Time Feedback**: Instant process status  
- **Modal Windows**: Modern popup designs  
- **Loading Animations**: Visual feedback during operations  

---

## 🏗️ Technical Architecture

### 📁 Project Structure
```
Project/
├── 📁 backend/                    # Backend uygulaması
│   ├── 🐍 web_app.py             # Ana Flask uygulaması 
│   ├── 📁 instance/              # Veritabanı dosyaları
│   │   └── 🗄️ geminiapi.db      # SQLite veritabanı
│   ├── 📁 uploads/               # Yüklenen dosyalar
│   │   └── 📄 [UUID]_[filename]  # Güvenli dosya adlandırma
│   └── 📁 generated_images/      # AI tarafından oluşturulan dosyalar
│       ├── 🖼️ generated_[UUID].png
│       └── 🎬 video_[UUID].mp4   # Oluşturulan videolar
├── 📁 frontend/                  # Frontend dosyaları
│   ├── 📁 templates/             # HTML şablonları
│   │   ├── 🏠 index.html        # Ana sayfa 
│   │   ├── 🔐 login.html        # Giriş sayfası 
│   │   ├── 📝 register.html     # Kayıt sayfası 
│   │   ├── 🟠 trendyol_product.html  # Trendyol sayfası 
│   │   └── 🔵 n11_product.html  # N11 sayfası 
│   └── 📁 static/               # Statik dosyalar
│       ├── 📁 css/              # Stil dosyaları
│       │   ├── 🎨 style.css     # Ana stil dosyası
│       │   ├── 🟠 trendyol.css  # Trendyol özel stilleri
│       │   └── 🔵 n11.css       # N11 özel stilleri
│       ├── 📁 js/               # JavaScript dosyaları
│       │   ├── ⚡ script.js     # Ana JavaScript
│       │   ├── 🟠 trendyol.js   # Trendyol özel fonksiyonlar
│       │   └── 🔵 n11.js        # N11 özel fonksiyonlar
│       └── 📁 images/           # Görsel dosyalar
│           ├── 🟠 n11_logo.png
│           └── 🟠 trendyol_logo.png
└── 📄 README.md                 # Bu dosya
```
</div>

