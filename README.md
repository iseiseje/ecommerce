# E-Commerce Mobile App & Admin Backend Ecosystem 🛍️⚡

Platform E-Commerce *full-stack* berbasis **React Native (Expo SDK 57)** untuk aplikasi mobile (Android & iOS) dan **Laravel 11 Filament 3** untuk Panel Administrator (VPS), terintegrasi dengan **Supabase PostgreSQL**, **Edge Functions**, **RainyPay QRIS Gateway**, dan **Genlook AI Virtual Try-On**.

---

## 📐 Arsitektur Sistem

```
+-------------------------------------------------------------------+
|                        MOBILE APP (ANDROID / IOS)                 |
|                   React Native Expo SDK 57 (TypeScript)           |
+---------------------------------+---------------------------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
+-------------------------------+   +-------------------------------+
|      SUPABASE CLOUD INFRA     |   |   LARAVEL FILAMENT ADMIN VPS  |
|  - PostgreSQL Database & RLS  |   |  - Laravel 11 + Filament 3    |
|  - Auth & Google OAuth        |   |  - Product & Variant Mgmt     |
|  - Realtime User Sync         |   |  - Order Fulfillment          |
|  - Storage Buckets            |   |  - Auto REST Sync to Supabase |
+---------------+---------------+   +-------------------------------+
                |
                v
+-------------------------------+
|    SUPABASE EDGE FUNCTIONS    |
|  - rainypay-create (QRIS)     |
|  - rainypay-webhook (Payment) |
|  - genlook-tryon (AI Try-On)  |
|  - genlook-status (AI Status) |
+---------------+---------------+
                |
        +-------+-------+
        |               |
        v               v
+---------------+ +---------------+
| RainyPay QRIS | |  Genlook AI   |
| API Gateway   | | Virtual TryOn |
+---------------+ +---------------+
```

---

## 🛠️ Tech Stack & Modul

### 📱 Frontend Mobile (Android APK & iOS)
- **Framework**: React Native (Expo SDK 57, Expo Router v4 - File-based Routing).
- **Bahasa**: TypeScript / JavaScript (ES6+).
- **State & Context**: AuthContext, CartContext, FavoritesContext.
- **Styling**: NativeWind / Tailwind CSS & StyleSheet React Native.
- **Fitur Utama**:
  - **Home Dashboard**: Banner Carousel, Flash Sale, Kategori Produk, Search Bar.
  - **Katalog & Detail Produk**: Variant Selection (Warna/Ukuran), Gambar Media Gallery.
  - **Keranjang & Checkout**: Penanganan Alamat Pengiriman, Kupon Promo, Perhitungan Total.
  - **Pembayaran QRIS**: Integrasi RainyPay QRIS via Supabase Edge Function (Checkout URL & Webhook update status).
  - **Virtual Fitting Room (AI Try-On)**: Modal interaktif uji coba pakaian secara virtual dengan Genlook API.
  - **Manajemen Pesanan**: Riwayat & Detail Pesanan Real-time (`src/app/orders.tsx` & `src/app/order/[id].tsx`).
  - **Favorit / Wishlist**: Penyimpanan produk impian pengguna.

### 🖥️ Backend Admin Panel (Laravel VPS)
- **Framework**: Laravel 11.x & Filament PHP 3.x (Admin Dashboard).
- **Database Connection**: Direct Connection & PgBouncer Pooler ke Supabase PostgreSQL.
- **Fitur Utama**:
  - Manajemen Produk, Media Produk, Variant (Warna/Ukuran).
  - Manajemen Kategori dengan **Auto Synchronize HTTP Hook** ke REST API Supabase (`Category.php`).
  - Manajemen Banner Promosi & Voucher Diskon.
  - Tracking status pesanan (*Pending*, *Paid*, *Diproses*, *Dikirim*, *Selesai*, *Dibatalkan*).

### ☁️ Supabase Infrastructure & Serverless
- **Database**: PostgreSQL dengan skema terstruktur (`products`, `categories`, `orders`, `order_items`, `users`, `promos`, `flash_sales`, `cart`, `wishlist`).
- **Row-Level Security (RLS)**: Enforcing data isolation per authenticated user.
- **Triggers**: Automatisasi sinkronisasi registrasi Auth Supabase ke tabel `users`.
- **Edge Functions (Deno Runtime)**:
  - `rainypay-create`: Membuat transaksi QRIS secara aman dari sisi server dengan idempotency key.
  - `rainypay-webhook`: Memproses notifikasi event `payment.paid` dari RainyPay dengan validasi HMAC Signature SHA-256.
  - `genlook-tryon`: Mengirimkan request fitting virtual ke server Genlook AI.
  - `genlook-status`: Melakukan polling status pemrosesan simulasi AI.

---

## 📁 Struktur Direktori Project

```text
├── assets/                       # Image, Font, dan Asset Stasis Mobile
├── backend/                      # Laravel 11 Filament Admin Panel
│   ├── app/                      # Models, Controllers, Filament Resources
│   ├── config/                   # Konfigurasi Laravel
│   ├── database/                 # Migration & Seeders
│   └── routes/                   # Web & Console Routes
├── scripts/                      # Script Pembantu Setup
├── src/                          # React Native (Expo) Source Code
│   ├── app/                      # Pages & Routes (Expo Router)
│   │   ├── (tabs)/               # Tab Navigation (Home, Cart, Favorites, Profile)
│   │   ├── order/                # Detail Pesanan ([id].tsx)
│   │   ├── checkout.tsx          # Halaman Checkout
│   │   └── product/[id].tsx      # Halaman Detail Produk
│   ├── components/               # Komponen Reusable (ProductCard, TryOnModal, FlashSale, dll)
│   ├── context/                  # AuthContext, CartContext, FavoritesContext
│   ├── services/                 # API & Category Services
│   └── utils/                    # Supabase JS Client Init
├── supabase/                     # Supabase Edge Functions & Config
│   └── functions/                # Deno Edge Functions (rainypay-create, rainypay-webhook, dll)
├── .env.example                  # Template Environment Variables Mobile App
├── app.json                      # Konfigurasi Expo & Android Build (Package Name, Splash, Icon)
├── eas.json                      # Konfigurasi EAS Build untuk APK Android
├── package.json                  # Dependencies NPM
└── README.md                     # Dokumentasi Teknikal Project
```

---

## 🚀 Panduan Memulai & Pengembangan Lokal

### 1. Prasyarat
- Node.js >= 18.x
- NPM >= 9.x
- PHP >= 8.2 & Composer (Untuk Backend Laravel)
- Expo CLI (`npm install -g eas-cli`)

---

### 2. Setup Mobile App (Expo React Native)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**:
   Salin `.env.example` menjadi `.env` dan lengkapi nilainya:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
   ```

3. **Jalankan Development Server**:
   ```bash
   npx expo start
   ```
   *Tekan `a` untuk membuka di Android Emulator/Device.*

---

### 3. Setup Backend Admin Panel (Laravel VPS)

1. **Masuk ke direktori backend & install composer**:
   ```bash
   cd backend
   composer install
   ```

2. **Konfigurasi Environment Variables Backend**:
   Salin `backend/.env.example` menjadi `backend/.env` dan atur koneksi Supabase PostgreSQL:
   ```env
   APP_NAME="Laravel Admin"
   APP_ENV=local
   APP_KEY=
   APP_URL=http://localhost:8000

   DB_CONNECTION=pgsql
   DB_URL=postgresql://postgres.xxx:password@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Generate App Key & Jalankan Server**:
   ```bash
   php artisan key:generate
   php artisan serve
   ```
   Akses panel admin di `http://localhost:8000/admin`.

---

### 4. Build APK Android (Production / Preview Release)

Proyek ini telah dikonfigurasi dengan Expo Application Services (**EAS**).

1. **Login ke Expo Account**:
   ```bash
   eas login
   ```

2. **Build Standalone APK Android (Standalone Installer)**:
   ```bash
   eas build --platform android --profile preview
   ```
   *Hasil build berupa file `.apk` siap install di HP Android.*

3. **Build Android App Bundle (AAB untuk Google Play Store)**:
   ```bash
   eas build --platform android --profile production
   ```

---

### 5. Deployment Supabase Edge Functions

Untuk mendeploy Edge Functions ke Supabase Project:

```bash
# Deploy Rainypay Edge Functions
supabase functions deploy rainypay-create --no-verify-jwt
supabase functions deploy rainypay-webhook --no-verify-jwt

# Deploy Genlook AI Edge Functions
supabase functions deploy genlook-tryon
supabase functions deploy genlook-status
```

---

## 🔒 Kebijakan Keamanan & Production Cleanup

- **Manajemen Secret**: Semua credential sensitif (Service Role Key, Password DB, Webhook Secret) **TIDAK TER-COMMIT** ke Git dan wajib menggunakan Environment Variables (`.env` / Supabase Secrets).
- **Row Level Security (RLS)**: Diaktifkan pada tabel Supabase untuk memastikan pengguna hanya dapat mengakses data milik mereka sendiri.
- **Webhook Verification**: Webhook RainyPay memverifikasi signature `X-RainyPay-Signature` menggunakan SHA-256 HMAC untuk mencegah pemalsuan callback pembayaran.

---

## 📄 Lisensi

Hak Cipta © 2026 E-Commerce Platform. Seluruh hak cipta dilindungi undang-undang.
