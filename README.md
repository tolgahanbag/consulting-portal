# Consulting Portal (EstonTurk)

Next.js 14 + Prisma + NextAuth tabanlı danışmanlık portalı.  
Müşteri başvuruları, admin yönetimi, teklif/iş akışı, doküman ve bildirim akışlarını içerir.

## Özellikler
- Çok dilli arayüz (`tr`, `en`, `et`)
- Müşteri paneli ve admin paneli
- Başvuru, teklif ve iş akışı yönetimi
- Doküman yükleme/indirme (Cloudflare R2 veya lokal fallback)
- Bildirim, email ve WhatsApp entegrasyonu
- Audit log ve raporlama

## Gereksinimler
- Node.js 18+
- npm

## Kurulum
```bash
npm install
```

## Ortam Değişkenleri
`.env` dosyanızı `.env.example` üzerinden oluşturun.

Gerekli değişkenler:
- `DATABASE_URL` (SQLite için `file:./prisma/dev.db`)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Opsiyonel:
- SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
- WhatsApp (`WHATSAPP_API_URL`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`)
- Cloudflare R2 (`R2_*`)

## Veritabanı
```bash
npx prisma generate
npx prisma db push
```

Seed (varsayılan admin):
```bash
npx prisma db seed
```

Varsayılan admin:
- Email: `admin@estonturk.com`
- Şifre: `admin123`

## Çalıştırma
```bash
npm run dev
```

## Scriptler
```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:watch
```

## API Endpoint Özeti

Kimlik doğrulama:
- `POST /api/auth/register` yeni kullanıcı kaydı
- `POST /api/auth/[...nextauth]` giriş (NextAuth)

Başvurular:
- `GET /api/applications` başvuruları listeler (admin: tümü, client: kendi başvuruları)
- `POST /api/applications` yeni başvuru oluşturur
- `GET /api/applications/:id` başvuru detayı
- `PATCH /api/applications/:id` başvuru günceller (admin)
- `DELETE /api/applications/:id` başvuru siler (admin)
- `POST /api/applications/:id/notes` not ekler (admin)
- `DELETE /api/applications/:id/notes?noteId=...` not siler (admin)

Teklifler:
- `POST /api/quotes` teklif oluşturur (admin)
- `PATCH /api/quotes/:id` teklif günceller (admin)
- `DELETE /api/quotes/:id` teklif siler (admin)
- `POST /api/quotes/:id/respond` teklif kabul/red (client)

İş akışı:
- `POST /api/workflows` workflow oluşturur (admin)
- `PATCH /api/workflows/:id` workflow günceller (admin)
- `DELETE /api/workflows/:id` workflow siler (admin)
- `POST /api/workflows/:id/requests` workflow mesajı/isteği (admin/client)

Dokümanlar:
- `POST /api/documents` doküman yükleme
- `GET /api/documents/:id/download` doküman indirme
- `GET /api/admin/documents` admin doküman liste
- `DELETE /api/admin/documents/:id` admin doküman sil
- `POST /api/company/:id/documents` şirket evrağı yükleme (admin)

Şirket kayıtları:
- `POST /api/company` şirket kaydı oluşturur (admin)
- `GET /api/company/:id` şirket kaydı getirir (admin/owner)

Bildirimler:
- `GET /api/notifications` kullanıcı bildirimleri
- `GET /api/admin/notifications` admin bildirim listesi
- `POST /api/admin/notifications` yayın bildirimi (admin)
- `POST /api/notifications/read-all` tümünü okundu yapar

Admin:
- `GET /api/admin/users` kullanıcı listesi (admin)
- `POST /api/admin/users` kullanıcı oluşturur (admin)
- `GET /api/admin/users/:id` kullanıcı detayı (admin)
- `PATCH /api/admin/users/:id` kullanıcı günceller (admin)
- `DELETE /api/admin/users/:id` kullanıcı siler (admin)
- `GET /api/admin/settings` ayarları getirir (admin)
- `PUT /api/admin/settings` ayar günceller (admin)
- `GET /api/admin/reports` raporlar (admin)
- `GET /api/admin/translations` çeviri listesi (admin)
- `GET /api/admin/audit-logs` audit log listesi (admin)

## Notlar
- Rate limit mekanizması bellek içidir; çoklu instance/production için Redis gibi bir store önerilir.
- Lokal doküman yüklemeleri `uploads/` altında tutulur.
