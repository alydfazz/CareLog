# Maintenance & Service Log

Aplikasi web *full-stack* untuk mencatat dan memantau riwayat perawatan barang berharga (seperti kendaraan, elektronik, atau perangkat kerja) lengkap dengan perhitungan total biaya servis, ringkasan status perawatan terakhir per barang, pencarian, filter, dan paginasi.

## Fitur Utama

- **Autentikasi & Keamanan Sesi:** Registrasi akun (dengan *auto-login*), Login, Logout, serta proteksi rute menggunakan **JWT Access Token** dan **Stateful Refresh Token** (di-*hash* dan disimpan di database).
- **Dashboard Ringkasan Perawatan:**
  - Total keseluruhan biaya perawatan (format Rupiah).
  - Total jumlah catatan servis dan jumlah barang terdaftar.
  - Kartu status per barang yang menampilkan tanggal servis terakhir, jenis servis terakhir, frekuensi servis, dan akumulasi biaya per barang.
- **Manajemen Catatan Servis (CRUD):** Tambah, lihat, ubah (*edit*), dan hapus catatan perawatan (`item_name`, `service_type`, `service_date`, `cost`, `notes`).
- **Pencarian, Filter & Paginasi:** Pencarian kata kunci secara *real-time*, filter cepat dengan klik kartu barang, serta navigasi halaman (*server-side pagination*).

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Passport JWT, Bcrypt
- **Database & ORM:** PostgreSQL 17, Prisma ORM

## Struktur Proyek

```text
maintenance-log-app/
├── backend/                  # REST API NestJS & Prisma ORM (Port 3001)
│   ├── prisma/
│   │   └── schema.prisma     # Skema database User & Maintenance
│   └── src/
│       ├── auth/             # Modul registrasi, login, refresh token & JWT Guard
│       ├── maintenances/     # Modul CRUD, ringkasan biaya, filter & paginasi
│       └── prisma/           # PrismaService & PrismaModule
├── frontend/                 # Aplikasi Web Next.js (Port 3000)
│   └── src/
│       ├── app/
│       │   ├── login/        # Halaman masuk
│       │   ├── register/     # Halaman pendaftaran akun
│       │   └── maintenances/ # Dashboard utama & manajemen riwayat servis
│       ├── lib/              # Helper request API & auto-refresh token
│       └── types/            # Definisi tipe TypeScript
└── README.md
```

## Cara Menjalankan Proyek di Lokal

### 1. Prasyarat
- Node.js (v18 atau lebih baru)
- `pnpm` (`npm install -g pnpm`)
- PostgreSQL 17 (buat database kosong bernama `maintenance_log`)

### 2. Konfigurasi & Jalankan Backend
```bash
cd backend
pnpm install
```

Buat file `.env` di dalam folder `backend/` dan sesuaikan kredensial PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/maintenance_log?schema=public"
JWT_SECRET="ganti_dengan_secret_key_akses_yang_kuat"
JWT_REFRESH_SECRET="ganti_dengan_secret_key_refresh_yang_kuat"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Jalankan migrasi database dan nyalakan server backend:
```bash
pnpm exec prisma migrate dev
pnpm run start:dev
```
Server backend akan berjalan di `http://localhost:3001`.

### 3. Konfigurasi & Jalankan Frontend
Buka terminal baru, masuk ke folder `frontend/`, lalu instal dependensi:
```bash
cd frontend
pnpm install
```

Buat file `.env.local` di dalam folder `frontend/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Jalankan server frontend:
```bash
pnpm run dev
```
Buka `http://localhost:3000` di browser untuk mulai menggunakan aplikasi.

## Daftar Endpoint API

| Method | Endpoint | Keterangan | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Mendaftarkan pengguna baru | Tidak |
| `POST` | `/auth/login` | Masuk dan mendapatkan `access_token` & `refresh_token` | Tidak |
| `POST` | `/auth/refresh` | Memperbarui `access_token` menggunakan `refresh_token` | Ya |
| `POST` | `/auth/logout` | Menghapus sesi `refresh_token` pengguna | Ya |
| `GET` | `/maintenances` | Mengambil daftar servis (`page`, `limit`, `search`, `item_name`) + ringkasan | Ya |
| `POST` | `/maintenances` | Menambahkan catatan servis baru | Ya |
| `PATCH` | `/maintenances/:id` | Memperbarui catatan servis berdasarkan ID | Ya |
| `DELETE` | `/maintenances/:id` | Menghapus catatan servis berdasarkan ID | Ya |