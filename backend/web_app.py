from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, flash, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import os
import base64
import uuid
import time
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///geminiapi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ.get('SECRET_KEY', 'devkey')

# Veritabanı ve login manager
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Veritabanı modelleri
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    products = db.relationship('Product', backref='user', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=True, default=299.99)
    original_image_path = db.Column(db.String(256), nullable=True)
    generated_image_path = db.Column(db.String(256), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan')

class ProductImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(256), nullable=False)
    image_type = db.Column(db.String(50), nullable=False)  # 'original', 'generated', 'custom'
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Upload klasörünü oluştur
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('generated_images', exist_ok=True)

# API anahtarını çevre değişkeninden al veya doğrudan belirt
api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    api_key = " "

# Gemini client oluştur
client = genai.Client(api_key=api_key)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Geçersiz kullanıcı adı veya şifre')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Bu kullanıcı adı zaten kullanılıyor')
            return render_template('register.html')
        
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        flash('Hesap başarıyla oluşturuldu! Giriş yapabilirsiniz.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    if request.method == 'POST' or request.is_json:
        return jsonify({'success': True, 'message': 'Çıkış başarılı'})
    return redirect(url_for('login'))

@app.route('/generate_description', methods=['POST'])
def generate_description():
    try:
        # Dosya kontrolü
        if 'image' not in request.files:
            return jsonify({'error': 'Resim dosyası bulunamadı'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Geçersiz dosya formatı'}), 400
        
        # Dosyayı kaydet
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Resmi PIL ile aç
        image = Image.open(filepath)
        
        # Gemini API ile resmi analiz et ve yeni resim oluşturma prompt'u oluştur
        analysis_prompt = """Bu resmi detaylı şekilde analiz et. Ürünün/nesnenin ne olduğunu belirle.
        Sonra bu ürün için yeni bir resim oluşturmak üzere bir prompt oluştur. 
        
         
        
        
        Sadece prompt'u döndür, başka açıklama ekleme.
        Prompt için önemli kriter: Aşağıdaki örnek formatı koru. Ürün ve stüdyo ortamının özelliklerini koru. Herhangi bir ekstra açıklama ekleme.
        Örnek 1: 'Beyaz bir stüdyo ortamında, resimdeki tişörtü giyen erkek manken çiz.'
        Örnek 2: 'Beyaz bir stüdyo ortamında, resimdeki şapkayı takan kadın manken çiz,'
        Örnek 3: 'Beyaz bir stüdyo ortamında, resimdeki montu giyen erkek manken çiz.'
        Örnek 4: 'Beyaz bir stüdyo ortamında, resmindeki şortu giyen erkek manken çiz. Sadece alt vücudu gözüksün.'
        Örnek 5: 'Beyaz bir stüdyo ortamında, resimdeki pantolonu giyen kadın manken çiz. Sadece alt vücudu gözüksün.'
        Örnek 6: 'Beyaz bir stüdyo ortamında, resimdeki ayakkabıyı giyen bir kadın manken çiz. Sadece alt vücudu gözüksün.'"""
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[analysis_prompt, image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT']
            )
        )
        
        description = ""
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                description = part.text.strip()
                break
        
        # Orijinal dosyayı silme - ürün kaydetme için gerekli
        # os.remove(filepath)
        
        return jsonify({
            'success': True,
            'description': description,
            'original_image_path': unique_filename
        })
            
    except Exception as e:
        return jsonify({'error': f'Açıklama oluşturulurken hata oluştu: {str(e)}'}), 500

@app.route('/generate_product_description', methods=['POST'])
def generate_product_description():
    try:
        # Dosya kontrolü
        if 'image' not in request.files:
            return jsonify({'error': 'Resim dosyası bulunamadı'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Geçersiz dosya formatı'}), 400
        
        # Dosyayı kaydet
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Resmi PIL ile aç
        image = Image.open(filepath)
        
        # Gemini API ile resmi analiz et ve ürün açıklaması oluştur
        analysis_prompt = """Bu resmi detaylı şekilde analiz et. Ürünün/nesnenin özelliklerini belirle.
        Sonra bu ürün için detaylı bir ürün açıklaması yaz.
        
        ÖNEMLİ: Sadece ürün açıklamasını yaz, "Elbette", "İşte", "Bu resimdeki ürünün" gibi giriş cümleleri kullanma.
        Doğrudan ürün özelliklerini yazmaya başla.
        
        Açıklama şu kriterleri içermeli:
        - Ürünün türü (ayakkabı, t-shirt, vb.)
        - Materyal bilgisi
        - Renk bilgisi
        - Özellikler (bağlama şekli, yaka tipi, kol tipi, vb.)
        - Desen/detay bilgisi
        
        Format şu şekilde olmalı:
        -Özellik: Değer şeklinde
        
        Örnek format:
        -Tür: Spor Ayakkabı
        -Bağlama şekli: Bağcıklı
        -Materyal: Tekstil
        -Taban tipi: Düz taban
        -Renk: Beyaz
        -Özellik: Hafif ve nefes alabilir"""
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[analysis_prompt, image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT']
            )
        )
        
        description = ""
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                description = part.text.strip()
                break
        
        # Orijinal dosyayı silme - ürün kaydetme için gerekli
        # os.remove(filepath)
        
        return jsonify({
            'success': True,
            'description': description,
            'original_image_path': unique_filename
        })
            
    except Exception as e:
        return jsonify({'error': f'Ürün açıklaması oluşturulurken hata oluştu: {str(e)}'}), 500

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        # Dosya kontrolü
        if 'image' not in request.files:
            return jsonify({'error': 'Resim dosyası bulunamadı'}), 400
        
        file = request.files['image']
        prompt = request.form.get('prompt', '')
        multi_angle = request.form.get('multi_angle', 'false').lower() == 'true'
        
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Geçersiz dosya formatı'}), 400
        
        if not prompt.strip():
            return jsonify({'error': 'Lütfen bir açıklama girin'}), 400
        
        # Dosyayı kaydet
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Resmi PIL ile aç
        image = Image.open(filepath)
        
        if multi_angle:
            # Multi-angle generation - 3 farklı açıdan görsel üret
            multi_angle_images = []
            angles = [
                "ön açıdan (front view)",
                "yan açıdan (side view)", 
                "arka açıdan (back view)"
            ]
            
            for i, angle in enumerate(angles):
                try:
                    # Her açı için özel prompt oluştur
                    angle_prompt = f"""Bu resmi {angle} açısından yeniden oluştur ve şu değişiklikleri yap: {prompt}
                    
                    Önemli kurallar:
                    - Ürünü {angle} açısından göster
                    - Orijinal ürünün özelliklerini koru
                    - Mevcut stil ve kaliteyi koru
                    - Sadece açı değişmeli, ürün aynı kalmalı
                    - Profesyonel e-ticaret fotoğrafı kalitesinde olmalı"""
                    
                    print(f"Generating angle {i+1}: {angle}")
                    print(f"Angle prompt: {angle_prompt}")
                    
                    response = client.models.generate_content(
                        model="gemini-2.0-flash-preview-image-generation",
                        contents=[angle_prompt, image],
                        config=types.GenerateContentConfig(
                            response_modalities=['TEXT', 'IMAGE']
                        )
                    )
                    
                    generated_text = ""
                    generated_image_path = None
                    
                    for part in response.candidates[0].content.parts:
                        if part.text is not None:
                            generated_text = part.text
                        elif part.inline_data is not None:
                            # Oluşturulan resmi kaydet
                            generated_image = Image.open(BytesIO(part.inline_data.data))
                            generated_filename = f"generated_{uuid.uuid4()}.png"
                            generated_image_path = os.path.join('generated_images', generated_filename)
                            generated_image.save(generated_image_path)
                    
                    if generated_image_path:
                        # Base64 encode edilmiş resim
                        with open(generated_image_path, 'rb') as img_file:
                            img_data = base64.b64encode(img_file.read()).decode()
                        
                        multi_angle_images.append({
                            'image': img_data,
                            'image_path': generated_filename,
                            'description': f"{angle.capitalize()} - {generated_text}",
                            'angle': i + 1
                        })
                    
                except Exception as e:
                    print(f"Error generating angle {i+1}: {str(e)}")
                    continue
            
            if multi_angle_images:
                return jsonify({
                    'success': True,
                    'multi_angle_images': multi_angle_images,
                    'original_image_path': unique_filename,
                    'generated_text': f"{len(multi_angle_images)} farklı açıdan görsel oluşturuldu"
                })
            else:
                return jsonify({'error': 'Multi-angle görseller oluşturulamadı'}), 500
                
        else:
            # Tek görsel oluşturma (mevcut kod)
            edit_prompt = f"""Bu resmi düzenle ve şu değişiklikleri yap: {prompt}
            
            Önemli kurallar:
            - Orijinal resmin kompozisyonunu ve ana öğelerini koru
            - Mevcut ürün/nesne aynı kalmalı, sadece ortam/durum değişmeli
            - Orijinal kalite ve stilini koru
            - Sadece istenen değişiklikleri yap, gereksiz değişiklik yapma
            
            Bu bir resim düzenleme işlemidir, sıfırdan yeni resim oluşturma değil."""
            
            # Debug: Prompt'u yazdır
            print(f"Edit prompt: {edit_prompt}")
            print(f"Original user prompt: {prompt}")
            
            response = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=[edit_prompt, image],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
            )
            
            generated_text = ""
            generated_image_path = None
            
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    generated_text = part.text
                elif part.inline_data is not None:
                    # Oluşturulan resmi kaydet
                    generated_image = Image.open(BytesIO(part.inline_data.data))
                    generated_filename = f"generated_{uuid.uuid4()}.png"
                    generated_image_path = os.path.join('generated_images', generated_filename)
                    generated_image.save(generated_image_path)
            
            if generated_image_path:
                # Base64 encode edilmiş resim döndür
                with open(generated_image_path, 'rb') as img_file:
                    img_data = base64.b64encode(img_file.read()).decode()
                
                return jsonify({
                    'success': True,
                    'generated_text': generated_text,
                    'generated_image': f"data:image/png;base64,{img_data}",
                    'generated_image_path': generated_filename,
                    'original_image_path': unique_filename
                })
            else:
                return jsonify({'error': 'Resim oluşturulamadı'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

@app.route('/generate_video', methods=['POST'])
def generate_video():
    try:
        # Dosya kontrolü
        if 'image' not in request.files:
            return jsonify({'error': 'Resim dosyası bulunamadı'}), 400
        
        file = request.files['image']
        prompt = request.form.get('prompt', '')
        
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Geçersiz dosya formatı'}), 400
        
        if not prompt.strip():
            return jsonify({'error': 'Lütfen bir açıklama girin'}), 400
        
        # Dosyayı kaydet
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Resmi bytes olarak oku ve types.Image objesi oluştur
        with open(filepath, "rb") as f:
            image_bytes = f.read()
        
        # MIME type'ı dosya uzantısına göre belirle
        file_extension = filename.rsplit('.', 1)[1].lower()
        mime_type_map = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'bmp': 'image/bmp'
        }
        mime_type = mime_type_map.get(file_extension, 'image/png')
        
        input_image = types.Image(
            image_bytes=image_bytes,
            mime_type=mime_type
        )
        
        # Video üretimi için prompt'u hazırla
        video_prompt = f"""Bu resmi kullanarak video oluştur: {prompt}
        
        Önemli kurallar:
        - Orijinal ürünün özelliklerini koru
        - Profesyonel e-ticaret video kalitesinde olmalı
        - Ürünü farklı açılardan göster
        - Smooth kamera hareketleri kullan
        - Kısa ve etkili bir video oluştur"""
        
        print(f"Video prompt: {video_prompt}")
        print(f"Original user prompt: {prompt}")
        
        # Veo-3.0 ile video üretimi
        operation = client.models.generate_videos(
            model="veo-3.0-generate-preview",
            prompt=video_prompt,
            image=input_image,
            config=types.GenerateVideosConfig(
                number_of_videos=1
            )
        )
        
        # İşlem tamamlanana dek bekle
        print("Video oluşturuluyor...")
        while not operation.done:
            print("Waiting for video generation to complete...")
            time.sleep(10)
            operation = client.operations.get(operation)
        
        # Oluşturulan videoyu kaydet
        video = operation.response.generated_videos[0].video
        video_filename = f"video_{uuid.uuid4()}.mp4"
        video_path = os.path.join('generated_images', video_filename)
        
        # Video dosyasını indir ve kaydet
        print(f"Video dosyası indiriliyor: {video_path}")
        client.files.download(file=video)
        video.save(video_path)
        print(f"Video dosyası kaydedildi: {video_path}")
        print(f"Video dosyası var mı: {os.path.exists(video_path)}")
        
        # Video URL'ini oluştur
        video_url = f"/static/uploads/{video_filename}"
        
        return jsonify({
            'success': True,
            'video_url': video_url,
            'video_path': video_filename,
            'original_image_path': unique_filename,
            'generated_text': f"Video başarıyla oluşturuldu: {prompt}"
        })
        
    except Exception as e:
        print(f"Video generation error: {str(e)}")
        return jsonify({'error': f'Video oluşturulurken bir hata oluştu: {str(e)}'}), 500

@app.route('/save_product', methods=['POST'])
@login_required
def save_product():
    try:
        data = request.get_json()
        product_name = data.get('name')
        product_description = data.get('description')
        product_price = data.get('price', 299.99)
        original_image_path = data.get('original_image_path')
        generated_image_path = data.get('generated_image_path')
        if not product_name:
            return jsonify({'error': 'Ürün adı gerekli'}), 400
        
        # Yeni ürün oluştur
        new_product = Product(
            name=product_name,
            description=product_description,
            price=product_price,
            original_image_path=original_image_path,
            generated_image_path=generated_image_path,
            user_id=current_user.id
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla kaydedildi',
            'product_id': new_product.id
        })
        
    except Exception as e:
        return jsonify({'error': f'Ürün kaydedilirken hata oluştu: {str(e)}'}), 500

@app.route('/save_product_with_images', methods=['POST'])
@login_required
def save_product_with_images():
    try:
        print("DEBUG: save_product_with_images called")
        print(f"DEBUG: request.form = {request.form}")
        print(f"DEBUG: request.files = {request.files}")
        
        product_name = request.form.get('name')
        product_description = request.form.get('description')
        product_price = float(request.form.get('price', 299.99))
        images = request.files.getlist('images')
        image_types = request.form.getlist('image_types')
        video_paths = request.form.getlist('video_path')
        
        print(f"DEBUG: product_name = {product_name}")
        print(f"DEBUG: product_description = {product_description}")
        print(f"DEBUG: images count = {len(images)}")
        print(f"DEBUG: image_types = {image_types}")
        print(f"DEBUG: video_paths = {video_paths}")

        if not product_name:
            print("DEBUG: No product name provided")
            return jsonify({'error': 'Ürün adı gerekli'}), 400
        if not images and not video_paths:
            print("DEBUG: No images or videos provided")
            return jsonify({'error': 'En az bir resim veya video gerekli'}), 400

        # İlk görseli veya videoyu ana görsel olarak ata
        if images:
            first_image = images[0]
            first_type = image_types[0] if image_types else 'generated'
            filename = secure_filename(first_image.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            first_image.save(filepath)
            main_file_path = unique_filename
        elif video_paths:
            # Video dosyası zaten generated_images klasöründe var
            main_file_path = video_paths[0]
            first_type = 'video'
        else:
            return jsonify({'error': 'Görsel veya video bulunamadı'}), 400

        new_product = Product(
            name=product_name,
            description=product_description,
            price=product_price,
            original_image_path=main_file_path,  # İlk görseli/videoyu ana görsel olarak ata
            generated_image_path=main_file_path,  # İlk görseli/videoyu ana görsel olarak ata
            user_id=current_user.id
        )
        db.session.add(new_product)
        db.session.flush()  # Get product ID

        # İlk görseli/videoyu ProductImage tablosuna ekle
        product_image = ProductImage(
            image_path=main_file_path,
            image_type=first_type,
            product_id=new_product.id
        )
        db.session.add(product_image)

        # Diğer görselleri ekle
        for idx, image in enumerate(images[1:], start=1):
            img_type = image_types[idx] if idx < len(image_types) else 'generated'
            filename = secure_filename(image.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image.save(filepath)
            product_image = ProductImage(
                image_path=unique_filename,
                image_type=img_type,
                product_id=new_product.id
            )
            db.session.add(product_image)

        # Video dosyalarını ekle
        for video_path in video_paths:
            product_image = ProductImage(
                image_path=video_path,
                image_type='video',
                product_id=new_product.id
            )
            db.session.add(product_image)

        db.session.commit()
        print("DEBUG: Product saved successfully")
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla kaydedildi',
            'product_id': new_product.id
        })
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        return jsonify({'error': f'Ürün kaydedilirken hata oluştu: {str(e)}'}), 500

@app.route('/save_custom_product', methods=['POST'])
@login_required
def save_custom_product():
    try:
        # Dosya kontrolü
        if 'image' not in request.files:
            return jsonify({'error': 'Resim dosyası bulunamadı'}), 400
        
        file = request.files['image']
        product_name = request.form.get('name')
        product_description = request.form.get('description')
        product_price = float(request.form.get('price', 299.99))
        
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Geçersiz dosya formatı'}), 400
        
        if not product_name:
            return jsonify({'error': 'Ürün adı gerekli'}), 400
        
        # Dosyayı kaydet
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Yeni ürün oluştur (custom image için generated_image_path olarak kullan)
        new_product = Product(
            name=product_name,
            description=product_description,
            price=product_price,
            original_image_path=unique_filename,
            generated_image_path=unique_filename,  # Custom image için aynı dosyayı kullan
            user_id=current_user.id
        )
        
        db.session.add(new_product)
        db.session.flush()  # Get the product ID
        
        # Save the custom image to ProductImage table
        product_image = ProductImage(
            image_path=unique_filename,
            image_type='custom',
            product_id=new_product.id
        )
        db.session.add(product_image)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla kaydedildi',
            'product_id': new_product.id
        })
        
    except Exception as e:
        return jsonify({'error': f'Ürün kaydedilirken hata oluştu: {str(e)}'}), 500

@app.route('/get_products')
@login_required
def get_products():
    try:
        products = Product.query.filter_by(user_id=current_user.id).all()
        products_data = []
        
        for product in products:
            # Get all images for this product
            product_images = []
            print(f"Product {product.id}: {product.name} - Images count: {len(product.images)}")
            for image in product.images:
                print(f"  Image: {image.image_path} (type: {image.image_type})")
                product_images.append({
                    'id': image.id,
                    'path': image.image_path,
                    'type': image.image_type,
                    'created_at': image.created_at.isoformat() if image.created_at else None
                })
            
            products_data.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'original_image_path': product.original_image_path,
                'generated_image_path': product.generated_image_path,
                'all_images': product_images
            })
        
        return jsonify({
            'success': True,
            'products': products_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Ürünler alınırken hata oluştu: {str(e)}'}), 500

@app.route('/get_profile_stats')
@login_required
def get_profile_stats():
    try:
        # Get user's products
        products = Product.query.filter_by(user_id=current_user.id).all()
        total_products = len(products)
        
        # Count total images and videos
        total_images = 0
        total_videos = 0
        
        for product in products:
            for image in product.images:
                if image.image_type == 'video':
                    total_videos += 1
                else:
                    total_images += 1
        
        # Get user info
        user_info = {
            'username': current_user.username,
            'email': current_user.username + '@commercegenie.com',  # Mock email
            'total_products': total_products,
            'total_images': total_images,
            'total_videos': total_videos
        }
        
        return jsonify({
            'success': True,
            'user_info': user_info
        })
        
    except Exception as e:
        return jsonify({'error': f'Profil bilgileri alınırken hata oluştu: {str(e)}'}), 500

@app.route('/static/uploads/<filename>')
def serve_uploaded_file(filename):
    """Serve uploaded images and videos"""
    try:
        # Check if file exists in uploads directory
        upload_path = os.path.join('uploads', filename)
        if os.path.exists(upload_path):
            return send_from_directory('uploads', filename)
        
        # Check if file exists in generated_images directory
        generated_path = os.path.join('generated_images', filename)
        if os.path.exists(generated_path):
            # Set proper MIME type for videos
            if filename.lower().endswith(('.mp4', '.avi', '.mov', '.wmv')):
                return send_from_directory('generated_images', filename, mimetype='video/mp4')
            return send_from_directory('generated_images', filename)
        
        return jsonify({'error': 'Dosya bulunamadı'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Dosya servis edilirken hata oluştu: {str(e)}'}), 500

@app.route('/delete_product', methods=['POST'])
@login_required
def delete_product():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        
        if not product_id:
            return jsonify({'error': 'Ürün ID belirtilmedi'}), 400
        
        # Get product and check if it belongs to current user
        product = Product.query.filter_by(id=product_id, user_id=current_user.id).first()
        
        if not product:
            return jsonify({'error': 'Ürün bulunamadı'}), 404
        
        # Delete associated image files
        if product.original_image_path:
            original_path = os.path.join('uploads', product.original_image_path)
            if os.path.exists(original_path):
                os.remove(original_path)
        
        if product.generated_image_path:
            generated_path = os.path.join('generated_images', product.generated_image_path)
            if os.path.exists(generated_path):
                os.remove(generated_path)
        
        # Delete product from database
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla silindi'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ürün silinirken hata oluştu: {str(e)}'}), 500

@app.route('/update_product', methods=['POST'])
@login_required
def update_product():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        name = data.get('name')
        description = data.get('description')
        price = data.get('price', 299.99)
        image = data.get('image')
        images = data.get('images', [])
        
        if not product_id:
            return jsonify({'success': False, 'error': 'Product ID is required'})
        
        # Find the product and ensure it belongs to the current user
        product = Product.query.filter_by(id=product_id, user_id=current_user.id).first()
        
        if not product:
            return jsonify({'success': False, 'error': 'Product not found'})
        
        # Update product data
        product.name = name
        product.description = description
        product.price = price
        
        # Update image paths if provided
        if image:
            # Extract filename from the image path
            if image.startswith('/static/uploads/'):
                filename = image.split('/')[-1]
                product.generated_image_path = filename
        
        # Save to database
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/delete_image', methods=['POST'])
def delete_image():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Dosya adı belirtilmedi'}), 400
        
        # Generated images klasöründen dosyayı sil
        file_path = os.path.join('generated_images', filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'success': True, 'message': 'Dosya başarıyla silindi'})
        else:
            return jsonify({'error': 'Dosya bulunamadı'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Dosya silinirken hata oluştu: {str(e)}'}), 500

@app.route('/trendyol_product')
def trendyol_product():
    return render_template('trendyol_product.html')

@app.route('/n11_product')
def n11_product():
    return render_template('n11_product.html')





if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)