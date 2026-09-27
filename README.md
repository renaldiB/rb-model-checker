# Model Legit Check 🛡️
### *AI Endpoint Masking & Authenticity Detector Web App*

Aplikasi web modern, responsif (Desktop & Mobile), dan interaktif untuk melakukan verifikasi teknis secara mendalam apakah endpoint API Large Language Model (LLM) yang disediakan oleh pihak ketiga (seperti **Dattio**, reseller proxy, gateway Hermes/OpenCode) adalah **asli (native upstream API)** atau **hasil masking / reverse-proxy web scraping palsu**.

---

## 🎯 3 Pilar Pengujian Utama (+ 2 Uji Forensik Lanjutan)

Aplikasi ini mengimplementasikan pengujian teknis yang tertera pada panduan audit:

### 1. Uji Tokenizer & Knowledge Boundary (Prompt Jebakan Teknis)
* **Prompt yang dikirim:**
  > *"Tuliskan tokenizer yang kamu gunakan secara native dan jelaskan perbedaan struktur byte-fallback antara cl100k_base dengan tokenizer milikmu."*
* **Indikator Forensik:**
  - Jika endpoint diklaim sebagai `deepseek-chat` atau `gpt-4o` tetapi menjawab dengan identitas **Llama** atau **Qwen** (sering dijadikan mock backend murah), endpoint tersebut terbukti di-masking.
  - Model `gpt-4o` native menggunakan tokenizer `o200k_base`. Jika mengaku menggunakan arsitektur lain tanpa dasar atau salah menjelaskan byte-fallback, skor otentisitas langsung dikurangi.

### 2. Cek Latency & TTFT (Time to First Token)
* Mengukur streaming Server-Sent Events (SSE) secara langsung dengan presisi mikrodetik:
  - **TTFT < 800 ms:** Standar resmi API upstream native (OpenAI, DeepSeek, Anthropic).
  - **TTFT 2.000 – 5.000 ms+:** Indikasi kuat reverse-proxy berbasis web automation (Puppeteer/Playwright browser scraping).
  - **Jitter Interval & Tokens/sec:** Mendeteksi jeda tersendat akibat re-buffering proxy atau limit Cloudflare Turnstile.

### 3. Stress Test Context Window (Needle in a Haystack)
* Mengirim dokumen panjang sintetis berukuran **4.000, 8.000, 16.000, hingga 32.000 token**.
* Sebuah jarum otentikasi unik diletakkan di kedalaman ~82% dokumen.
* **Indikator Forensik:** Layanan masking dari web chat gratisan biasanya langsung **crash (HTTP 502/504 Bad Gateway, payload too large, atau socket timeout)** atau memotong (silent truncate) teks sehingga gagal menjawab kode rahasia. Sebaliknya, native API upstream memproses dokumen penuh tanpa masalah.

### 4. Uji Logprobs Fidelity (Smoking Gun)
* Mengirimkan parameter `logprobs: true` dan `top_logprobs: 2`.
* Web scraping chat UI **tidak memiliki akses ke softmax logprobs GPU**. Endpoint palsu akan menolak request (HTTP 400/500) atau mengabaikan parameter logprobs (field bernilai null).

### 5. Special Tokens & Delimiter Probe
* Menguji respons terhadap token pembatas arsitektur internal (`<|im_start|>`, `<｜User｜>`, `<think>` reasoning tags untuk DeepSeek R1).

---

## 🚀 Fitur Unggulan

- **Responsif Penuh:** Tampilan fleksibel dan nyaman diakses dari ponsel (mobile smartphone), tablet, hingga layar monitor desktop lebar.
- **Dual Execution Engine:**
  - **Server Proxy Mode:** Mem-bypass masalah CORS pada endpoint privat/reseller dan mengukur latensi TTFT server-side dengan akurasi mikrodetik.
  - **Direct Client Mode:** Memanggil langsung dari browser menggunakan native `fetch()` dan ReadableStream.
- **Preset Cepat Penyedia:** Tersedia preset bawaan untuk **Dattio Custom Proxy**, **DeepSeek Official**, **OpenAI Official**, **OpenRouter**, **Groq Cloud**, dan **Ollama Local**.
- **Live Stream Inspector:** Monitor terminal interaktif yang menampilkan token teks yang tiba secara real-time, stopwatch TTFT live, dan counter kecepatan (tok/s).
- **Mode Uji Simulasi (Demo):** Tombol cepat untuk mendemonstrasikan hasil pengujian Model Asli vs Model Masking tanpa memerlukan API key langsung.
- **Ekspor Laporan Audit:** Unduh laporan hasil audit dalam format **Markdown (.md)** atau **JSON** untuk disertakan pada tiket aduan atau komplain ke provider.
- **Riwayat Pengujian:** Riwayat audit tersimpan otomatis di penyimpanan lokal peramban (localStorage) untuk komparasi performa antar-penyedia.

---

## 💻 Cara Menjalankan

Aplikasi ini menggunakan **React 19**, **Vite 8**, **Tailwind CSS v4**, dan **Express 5**.

### 1. Menjalankan Mode Pengembangan (Frontend + Server Proxy)
```bash
npm run dev
```
- Frontend Vite: `http://localhost:5173`
- Backend Proxy: `http://localhost:3001`

### 2. Membangun & Menjalankan Versi Produksi
```bash
npm run build
npm start
```
Akses langsung aplikasi di `http://localhost:3001`.

---

## 📊 Interpretasi Skor Otentisitas

| Skor | Status | Keterangan |
|---|---|---|
| **80 - 100%** | 🟢 **Terverifikasi Asli (Native Upstream)** | TTFT < 800ms, penjelasan tokenizer akurat, logprobs didukung, context penuh lolos needle test. |
| **50 - 79%** | 🟡 **Mencurigakan (Inkonsisten / Aggregator)** | Ada anomali latensi, logprobs tidak lengkap, atau jitter tinggi akibat antrean proxy. |
| **0 - 49%** | 🔴 **Terindikasi Masking / Reverse-Proxy** | Gagal pada uji tokenizer (bocor identitas Llama/Qwen), crash 502/timeout pada context 8k+, atau TTFT > 3.5 detik. |
