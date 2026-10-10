# API Manajemen Buku Perpustakaan

**Nama:** Muhammad Athar Rizwan Alfaiz
**NIM:** 2510512094

API Manajemen Buku Perpustakaan adalah layanan backend berbasis RESTful API untuk mengelola data katalog dan stok buku perpustakaan secara efisien dan andal.

---

## 1. Teknologi yang Digunakan

- **Runtime:** Node.js 20 (CommonJS)
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Database Driver:** `pg` (node-postgres, native SQL tanpa ORM)
- **Containerization & Orchestration:** Docker & Docker Compose

---

## 2. Struktur Folder

```
SC-BE-Tugas1/
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── db.js
│   ├── initDb.js
│   ├── server.js
│   └── routes/
│       └── books.js
└── tests/
    ├── requests.http
    └── test-endpoints.sh
```

---

## 3. Prasyarat

Pastikan perangkat Anda telah terpasang:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk Windows/macOS) atau Docker Engine + Docker Compose Plugin (untuk Linux).
- `curl` dan `bash` (opsional, untuk menjalankan script automated testing).

---

## 4. Setup

1. Duplikasi file konfigurasi environment dari template:
   ```bash
   cp .env.example .env
   ```
2. Sesuaikan konfigurasi di dalam file `.env` jika diperlukan:
   ```env
   APP_PORT=3000
   DB_HOST=db
   DB_PORT=5432
   DB_USER=libraryuser
   DB_PASSWORD=librarypass
   DB_NAME=librarydb
   POSTGRES_USER=libraryuser
   POSTGRES_PASSWORD=librarypass
   POSTGRES_DB=librarydb
   DB_EXPOSE_PORT=5433
   ```

---

## 5. Build & Run

1. Build dan jalankan seluruh container di latar belakang (*detached mode*):
   ```bash
   docker compose up -d --build
   ```
2. Cek status container:
   ```bash
   docker compose ps
   ```
3. Pantau log aplikasi `api`:
   ```bash
   docker compose logs -f api
   ```

---

## 6. Daftar Endpoint

| Method | Path | Deskripsi | Contoh Body |
|---|---|---|---|
| `GET` | `/health` | Memeriksa koneksi ke database | Tidak ada |
| `GET` | `/books` | Mengambil semua daftar buku (urut id ascending) | Tidak ada |
| `GET` | `/books/:id` | Mengambil detail buku berdasarkan ID (404 jika tidak ditemukan) | Tidak ada |
| `POST` | `/books` | Menambahkan buku baru (title & author wajib) | `{"title": "Clean Code", "author": "Robert C. Martin", "year": 2008, "stock": 5}` |
| `PUT` | `/books/:id` | Memperbarui data buku berdasarkan ID (404 jika tidak ditemukan) | `{"title": "Clean Code Updated", "author": "Robert C. Martin", "year": 2009, "stock": 8}` |
| `DELETE` | `/books/:id` | Menghapus buku berdasarkan ID (404 jika tidak ditemukan) | Tidak ada |

---

## 7. Cara Tes Endpoint

### A. Menggunakan Bash Script Otomatis
Jalankan script pengujian endpoint yang tersedia:
```bash
./tests/test-endpoints.sh
```
*Catatan: Anda dapat menentukan base URL lain dengan environment variable, contoh:*
```bash
BASE_URL=http://localhost:3000 ./tests/test-endpoints.sh
```

### B. Menggunakan VS Code REST Client
Buka file [`tests/requests.http`](file:///home/athar/Documents/GitHub/SC-BE-Tugas1/tests/requests.http) pada editor VS Code yang telah memiliki ekstensi **REST Client**, lalu klik **Send Request** di setiap endpoint.

### C. Menggunakan cURL Manual

1. **Health Check:**
   ```bash
   curl -X GET http://localhost:3000/health
   ```

2. **Menambah Buku Baru (POST):**
   ```bash
   curl -X POST http://localhost:3000/books \
     -H "Content-Type: application/json" \
     -d '{"title": "Laskar Pelangi", "author": "Andrea Hirata", "year": 2005, "stock": 10}'
   ```

3. **Melihat Semua Buku (GET):**
   ```bash
   curl -X GET http://localhost:3000/books
   ```

4. **Melihat Detail Satu Buku (GET by ID):**
   ```bash
   curl -X GET http://localhost:3000/books/1
   ```

5. **Mengupdate Buku (PUT):**
   ```bash
   curl -X PUT http://localhost:3000/books/1 \
     -H "Content-Type: application/json" \
     -d '{"title": "Laskar Pelangi (Edisi Baru)", "author": "Andrea Hirata", "year": 2008, "stock": 15}'
   ```

6. **Menghapus Buku (DELETE):**
   ```bash
   curl -X DELETE http://localhost:3000/books/1
   ```

---

## 8. Langkah Pengujian Persistensi Data

Ikuti langkah-langkah berikut untuk menguji bahwa data di PostgreSQL tetap tersimpan meskipun container dihentikan dan dibuat ulang:

1. Pastikan container berjalan, lalu tambahkan beberapa buku menggunakan perintah `POST /books`:
   ```bash
   curl -X POST http://localhost:3000/books \
     -H "Content-Type: application/json" \
     -d '{"title": "Buku Persistensi", "author": "Penulis Uji", "year": 2024, "stock": 7}'
   ```
2. Periksa bahwa data berhasil masuk dengan memanggil endpoint `GET /books`:
   ```bash
   curl -X GET http://localhost:3000/books
   ```
3. Hentikan dan hapus container **TANPA** menghapus volume:
   ```bash
   docker compose down
   ```
   > **PENTING:** Jangan sertakan flag `-v` atau `--volumes` pada perintah di atas, karena flag tersebut akan melenyapkan volume Docker beserta seluruh data database di dalamnya.
4. Buat ulang dan jalankan kembali container:
   ```bash
   docker compose up -d
   ```
5. Periksa kembali data buku menggunakan endpoint `GET /books`:
   ```bash
   curl -X GET http://localhost:3000/books
   ```
   Data yang sebelumnya ditambahkan pada langkah 1 harus tetap ada dan tidak hilang.
6. **Penjelasan:** Data tetap aman dan utuh karena direktori penyimpanan data PostgreSQL (`/var/lib/postgresql/data`) telah dipetakan ke named volume Docker (`pgdata`). Lifecycle named volume terpisah dari lifecycle container.
7. **Cara Reset Total (Opsional):** Jika Anda ingin menghapus seluruh data dan volume basis data secara permanen, gunakan flag `-v`:
   ```bash
   docker compose down -v
   ```

---

## 9. Troubleshooting

- **Port Bentrok (Port Conflict):**
  - Jika port `3000` atau `5433` telah digunakan oleh layanan lain di komputer host, ubah nilai `APP_PORT` atau `DB_EXPOSE_PORT` di dalam file `.env`.
- **Container `api` Gagal Start / Menunggu Database:**
  - Container `api` telah dikonfigurasi dengan dependensi `condition: service_healthy` terhadap container `db` serta memiliki mekanisme retry koneksi database internal hingga 10 kali (jeda 3 detik). Jika database butuh waktu inisialisasi lebih lama saat pertama kali dijalankan, pantau kesehatan container dengan `docker compose ps` atau periksa log menggunakan `docker compose logs db`.
- **Database Authentication Error:**
  - Pastikan nilai `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` pada file `.env` identik dengan nilai `POSTGRES_USER`, `POSTGRES_PASSWORD`, dan `POSTGRES_DB`. Jika Anda mengubah kredensial setelah volume dibuat, Anda perlu mereset volume dengan `docker compose down -v`.

---

## 10. Sumber & Bantuan AI

Proyek ini dibangun secara mandiri tanpa menggunakan starter kit atau template dari pihak ketiga (selain image Docker resmi `node:20-alpine` dan `postgres:16-alpine` dari Docker Hub).

Dalam proses pengembangannya:
- **Claude** digunakan dalam membantu merancang serta menyusun prompt spesifikasi arsitektur dan kebutuhan proyek.
- **AntiGravity** digunakan untuk melakukan *code generation* berdasarkan instruksi dan rancangan yang telah ditentukan.

Seluruh kode, konfigurasi, dan dokumentasi telah ditinjau (*reviewed*) serta diverifikasi secara langsung oleh pemilik proyek.
