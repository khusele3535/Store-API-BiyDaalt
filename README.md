
# Store API — BED411 Backend Development

## 1. Оюутны мэдээлэл

- **Оюутны нэр:** А. Хүсэлбаяр
- **Оюутны код:** B24FM1002
- **Хичээл:** BED411 — Backend хөгжил
- **Бие даалтын сэдэв:** Дэлгүүрийн REST API (Store API)

## 2. Төслийн танилцуулга

Store API нь дэлгүүрийн бараа бүтээгдэхүүн, ангилал, брэнд болон хэрэглэгчдийн үнэлгээг удирдах RESTful Backend API юм.

Энэхүү төсөл нь Node.js, Express.js, PostgreSQL болон Prisma ORM ашиглан боловсруулагдсан.

Үндсэн боломжууд:

- Category, Brand, Product, Review CRUD үйлдлүүд
- 23 REST API endpoint
- Бүтээгдэхүүн хайх, шүүх, эрэмбэлэх
- Pagination болон metadata
- Өгөгдөл шалгах (Validation)
- Нэгдсэн алдаа боловсруулах middleware
- Өгөгдлийн сангийн холбоос болон устгалтын дүрэм
- Swagger API Documentation
- Postman API Testing

## 3. Ашигласан технологи

| Технологи | Зориулалт |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| PostgreSQL | Өгөгдлийн сан |
| Prisma ORM | Database operations |
| JavaScript | Backend programming |
| Swagger / OpenAPI | API documentation |
| Postman | API testing |
| Git / GitHub | Version control |

## 4. Өгөгдлийн сангийн бүтэц

Төсөл нь дараах дөрвөн model-той.

### Category

- id
- name (unique)
- createdAt
- products

### Brand

- id
- name
- foundedYear (optional)
- createdAt
- products

### Product

- id
- title
- price
- stock
- description (optional)
- isAvailable
- categoryId
- brandId (optional)
- createdAt
- category
- brand
- reviews

### Review

- id
- rating
- comment (optional)
- authorName
- productId
- createdAt
- product

Нэг хэрэглэгч нэг бүтээгдэхүүнд нэг л үнэлгээ өгөх боломжтой.

Prisma schema:

`@@unique([productId, authorName])`

## 5. Database Relationships

### Category → Product (One-to-Many)

Нэг Category олон Product агуулж болно.

Устгалтын дүрэм: `onDelete: Restrict`

Category-д Product байгаа тохиолдолд Category-г устгах боломжгүй.

HTTP Status: `409 Conflict`

### Brand → Product (One-to-Many)

Нэг Brand олон Product-той байж болно.

Устгалтын дүрэм: `onDelete: SetNull`

Brand устах үед тухайн Brand-д хамаарах Product-ууд хадгалагдана.

Product-ийн `brandId` нь `null` болно.

HTTP Status: `204 No Content`

### Product → Review (One-to-Many)

Нэг Product олон Review-тэй байж болно.

Устгалтын дүрэм: `onDelete: Cascade`

Product устах үед түүнд хамаарах Review-ууд автоматаар устна.

HTTP Status: `204 No Content`

## 6. Төслийг суулгах

### Шаардлагатай програмууд

- Node.js
- PostgreSQL
- npm
- Git

### 1. Repository татах

```bash
git clone <YOUR_REPOSITORY_URL>
cd BiyDaalt
```

`<YOUR_REPOSITORY_URL>` хэсэгт GitHub repository-ийн бодит URL-ийг оруулна.

### 2. Dependencies суулгах

```bash
npm install
```

### 3. PostgreSQL database үүсгэх

PostgreSQL дээр дараах нэртэй database үүсгэнэ:

```text
store_db
```

### 4. Environment variables тохируулах

`.env.example` файлыг хуулж `.env` үүсгэнэ.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_db?schema=public"
PORT=3000
```

`YOUR_PASSWORD` хэсэгт PostgreSQL-ийн өөрийн нууц үгийг оруулна.

`.env` файлыг GitHub-д оруулахгүй.

### 5. Prisma Client үүсгэх

```bash
npx prisma generate
```

### 6. Database migration ажиллуулах

```bash
npx prisma migrate deploy
```

### 7. Seed өгөгдөл оруулах

```bash
npm run seed
```

Seed өгөгдөл:

- 5 Category
- 6 Brand
- 25 Product
- 60 Review
- 3 Product нь Brand-гүй

### 8. Server ажиллуулах

```bash
npm run dev
```

Server:

```text
http://localhost:3000
```

Health check:

```http
GET http://localhost:3000/health
```

Хүлээгдэх хариу:

```json
{
  "status": "ok"
}
```

## 7. API Endpoints

### Categories

| Method | Endpoint | Тайлбар |
|---|---|---|
| GET | /categories | Бүх ангилал |
| GET | /categories/:id | Нэг ангилал |
| GET | /categories/:id/products | Ангиллын бүтээгдэхүүн |
| POST | /categories | Ангилал нэмэх |
| PATCH | /categories/:id | Ангилал засах |
| DELETE | /categories/:id | Ангилал устгах |

### Brands

| Method | Endpoint | Тайлбар |
|---|---|---|
| GET | /brands | Бүх брэнд |
| GET | /brands/:id | Нэг брэнд |
| GET | /brands/:id/products | Брэндийн бүтээгдэхүүн |
| POST | /brands | Брэнд нэмэх |
| PATCH | /brands/:id | Брэнд засах |
| DELETE | /brands/:id | Брэнд устгах |

### Products

| Method | Endpoint | Тайлбар |
|---|---|---|
| GET | /products | Бүх бүтээгдэхүүн |
| GET | /products/:id | Нэг бүтээгдэхүүн |
| GET | /products/:id/reviews | Бүтээгдэхүүний үнэлгээ |
| POST | /products | Бүтээгдэхүүн нэмэх |
| PATCH | /products/:id | Бүтээгдэхүүн засах |
| DELETE | /products/:id | Бүтээгдэхүүн устгах |

### Reviews

| Method | Endpoint | Тайлбар |
|---|---|---|
| GET | /reviews | Бүх үнэлгээ |
| GET | /reviews/:id | Нэг үнэлгээ |
| POST | /reviews | Үнэлгээ нэмэх |
| PATCH | /reviews/:id | Үнэлгээ засах |
| DELETE | /reviews/:id | Үнэлгээ устгах |

Нийт: **23 endpoint** (давхар nested endpoint-үүдийг оролцуулсан).

## 8. Product Filtering

`GET /products` endpoint нь дараах query параметрүүдийг дэмжинэ.

| Parameter | Тайлбар |
|---|---|
| q | Нэрээр хайх |
| categoryId | Ангиллаар шүүх |
| brandId | Брэндээр шүүх |
| hasBrand | Брэндтэй эсэх |
| minPrice | Хамгийн бага үнэ |
| maxPrice | Хамгийн их үнэ |
| isAvailable | Бэлэн байгаа эсэх |
| sort | Эрэмбэлэх талбар |
| order | asc / desc |
| page | Хуудасны дугаар |
| limit | Нэг хуудсанд харуулах тоо |

Жишээ:

```http
GET /products?categoryId=1&minPrice=30000&maxPrice=100000&sort=price&order=desc&page=1&limit=10
```

Pagination response нь `data` болон `meta` хэсэгтэй.

`meta` нь `page`, `limit`, `total`, `pages` талбаруудыг агуулна.

## 9. HTTP Status Codes

| Status | Тайлбар |
|---|---|
| 200 | Амжилттай |
| 201 | Шинээр үүсгэсэн |
| 204 | Амжилттай устгасан |
| 400 | Буруу хүсэлт |
| 404 | Өгөгдөл олдоогүй |
| 409 | Өгөгдлийн зөрчил |
| 500 | Server-ийн алдаа |

Алдаануудыг төвлөрсөн Error Handler middleware боловсруулна.

## 10. Middleware

Төсөл дараах middleware-үүдийг ашиглана.

- `logger` — HTTP хүсэлтийн мэдээллийг бүртгэх
- `validate` — орж ирсэн өгөгдлийг шалгах
- `notFound` — байхгүй endpoint-д 404 буцаах
- `errorHandler` — алдааг нэгдсэн хэлбэрээр боловсруулах

## 11. Swagger Documentation

Swagger UI:

```text
http://localhost:3000/docs
```

Swagger дээр API endpoint-үүдийн:

- HTTP Method
- Request Parameters
- Request Body
- Response Schema
- Status Codes
- Example Values

зэргийг харах боломжтой.

`Try it out` ашиглан API хүсэлт илгээж болно.

## 12. Postman Testing

Postman Collection:

```text
File_postman_collection.json
```

Collection нь нийт 63 API request агуулна.

Үндсэн бүлгүүд:

1. Categories
2. Brands
3. Products
4. Reviews
5. Relationships

Дараах тохиолдлуудыг шалгана:

- CRUD үйлдлүүд
- Validation errors (400)
- Not Found errors (404)
- Conflict errors (409)
- Category Restrict deletion
- Brand SetNull deletion
- Product Cascade deletion
- Duplicate Review conflict
- Product filtering болон pagination

Collection variable:

```text
baseUrl = http://localhost:3000
```

Postman-д collection-ийг импортлоод хүсэлтүүдийг ажиллуулна.

## 13. Seed Data

`prisma/seed.js` файл нь туршилтын өгөгдөл үүсгэнэ.

Өгөгдөл:

- Categories: Electronics, Clothing, Home, Beauty, Sports
- Brands: Samsung, Apple, Nike, Adidas, Sony, Xiaomi
- Products: 25
- Reviews: 60

Seed-ийг ажиллуулах:

```bash
npm run seed
```

## 14. Мэдэгдэж буй дутагдал, хязгаарлалт

- Хэрэглэгчийн authentication болон authorization хэрэгжүүлээгүй.
- Бүтээгдэхүүний зураг upload хийх боломжгүй.
- Төлбөр тооцооны систем холбогдоогүй.
- Барааны захиалга болон хүргэлтийн модуль байхгүй.
- API нь сургалтын зориулалттай backend төсөл юм.

Эдгээр нь төслийн одоогийн хамрах хүрээний хязгаарлалтууд юм.

## 15. Дүгнэлт

Store API төсөл нь Node.js, Express.js, PostgreSQL, Prisma ORM ашиглан RESTful API боловсруулах, өгөгдлийн сангийн холбоос удирдах, CRUD үйлдэл хэрэгжүүлэх, validation болон error handling хийх мэдлэгийг нэгтгэсэн бие даалтын ажил юм.

Мөн Swagger болон Postman ашиглан API-г баримтжуулж, үйл ажиллагааг туршсан.

---

**Боловсруулсан:** А. Хүсэлбаяр  
**Оюутны код:** B24FM1002  
**Хичээл:** BED411 — Backend хөгжил
