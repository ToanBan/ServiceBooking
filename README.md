# Service Booking Management System


Hệ thống đặt lịch dịch vụ gồm backend ASP.NET Core Web API và frontend Next.js. Ứng dụng cho phép quản trị viên thiết lập dịch vụ, nhân viên và ca làm việc; khách hàng chọn dịch vụ, nhân viên, ngày và khung giờ để đặt lịch; quản trị viên xác nhận, hoàn tất hoặc theo dõi lịch hẹn.

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Công nghệ](#2-công-nghệ)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Yêu cầu môi trường](#4-yêu-cầu-môi-trường)
5. [Hướng dẫn cài đặt và chạy](#5-hướng-dẫn-cài-đặt-và-chạy)
6. [Tài khoản demo](#6-tài-khoản-demo)
7. [Dữ liệu mẫu](#7-dữ-liệu-mẫu)
8. [Màn hình](#8-màn-hình)
9. [CÁC API ĐÃ HOÀN THÀNH](#9-api)
10. [Test API](#10-test-api)
11. [Quy tắc nghiệp vụ và quyết định thiết kế](#11-quy-tắc-nghiệp-vụ-và-quyết-định-thiết-kế)
12. [Thiết kế database](#12-thiết-kế-database)
13. [Chức năng đã hoàn thành / chưa hoàn thành](#13-chức-năng-đã-hoàn-thành--chưa-hoàn-thành)
14. [Hạn chế đã biết và hướng phát triển](#14-hạn-chế-đã-biết-và-hướng-phát-triển)
15. [Khắc phục sự cố thường gặp](#15-khắc-phục-sự-cố-thường-gặp)

---

## 1. Giới thiệu

Hệ thống có **2 vai trò**:

| Vai trò | Mô tả |
|---|---|
| **Customer** | Xem danh sách dịch vụ, chọn nhân viên và khung giờ còn trống, đặt lịch, xem và hủy lịch hẹn của chính mình |
| **Admin** | Quản lý dịch vụ, xem nhân viên và ca làm việc, xem toàn bộ lịch hẹn, xác nhận hoặc hoàn tất lịch hẹn |

### Luồng chính

```text
Admin:  tạo dịch vụ (tên, thời lượng, giá)
        → tạo ca làm việc cho nhân viên (ngày, giờ bắt đầu, giờ kết thúc)

Customer: chọn dịch vụ
        → chọn nhân viên
        → chọn ngày
        → hệ thống tính danh sách khung giờ trống (nằm trọn trong ca, chưa qua, chưa bị đặt)
        → chọn khung giờ và đặt lịch  →  booking ở trạng thái Pending

Admin:  Pending  → Confirmed   (xác nhận)
        Confirmed → Completed  (hoàn tất, chỉ khi đã đến hoặc qua giờ kết thúc)
        Không xác nhận → khách hàng tự hủy (Cancelled, kèm lý do)
```

Trạng thái booking: `Pending → Confirmed → Completed`, nhánh rẽ `→ Cancelled`.

---

## 2. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | ASP.NET Core Web API trên **.NET 10** (`net10.0`), controller-based, Entity Framework Core 10 + Npgsql, JWT Bearer, BCrypt.Net-Next, SignalR |
| Frontend | **Next.js 16.3.7** (App Router) + **React 19.2.8** + TypeScript, Tailwind CSS 4, axios, `@microsoft/signalr`, lucide-react |
| Database | **PostgreSQL 16** (chạy bằng Docker) |
| Docker | `docker-compose.yml` đóng gói **database**. Backend và frontend chạy trực tiếp bằng `dotnet run` / `npm run dev` |

Phiên bản thư viện backend (`backend/ServiceBooking.Api.csproj`): `Microsoft.EntityFrameworkCore` 10.0.12, `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.3, `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.12, `Microsoft.AspNetCore.OpenApi` 10.0.11, `BCrypt.Net-Next` 4.2.0.

---

## 3. Cấu trúc thư mục

```text
ServiceBooking/
├── docker-compose.yml          # PostgreSQL 16 (service duy nhất: db)
├── docs/
│   └── ServiceBooking.postman_collection.json   # bộ test API cho Postman
├── backend/                    # ASP.NET Core Web API
│   ├── Program.cs              # DI, JWT, CORS, SignalR, tự migrate + seed khi khởi động
│   ├── appsettings.json        # Cấu hình thật (KHÔNG commit - đã bị .gitignore)
│   ├── Controllers/            # Auth, Service, Staff, Booking
│   ├── Services/               # AuthService, BookingService, ServiceService, StaffService,
│   │                           # JwtTokenService, BookingRealtimeNotifier
│   ├── Repositories/           # Truy vấn EF Core, chứa logic khóa dòng (row lock)
│   ├── Models/                 # User, Staff, Service, WorkSchedule, Booking (+ enum)
│   ├── DTOs/                   # Requests/ Responses/ Events/
│   ├── Data/                   # AppDbContext, DbSeeder
│   ├── Migrations/             # 2 migration: InitialCreate, AddStaff
│   ├── Middleware/             # ExceptionHandlingMiddleware
│   ├── Exceptions/             # AppException
│   ├── Hubs/                   # BookingHub (SignalR)
│   ├── Interfaces/             # Hợp đồng repository/service
│   └── Helpers/                # TokenHasher (SHA-256 cho refresh token)
└── frontend/                   # Next.js App Router
    ├── .env.example            # Mẫu biến môi trường
    ├── next.config.ts          # Rewrites /api/* và /hubs/* sang backend
    └── src/
        ├── app/                # Route: (auth), (customer), admin, forbidden
        ├── components/         # AdminGuard, UserMenu, Pagination
        ├── services/           # Gọi API (auth, booking, service, staff)
        ├── lib/http/           # axios client, interceptor, refresh token, ApiError
        ├── providers/          # AuthProvider (context đăng nhập)
        ├── hooks/              # useBookingRealtime (SignalR)
        ├── constants/          # routes.ts, api-endpoints.ts
        ├── config/             # env.ts
        └── types/              # Kiểu dữ liệu API
```

---

## 4. Yêu cầu môi trường

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| .NET SDK | **10.0** trở lên | Project target `net10.0`. Kiểm tra: `dotnet --version` |
| Node.js | **20** trở lên (khuyến nghị 22 LTS) | Kiểm tra: `node -v` |
| npm | đi kèm Node.js | Kiểm tra: `npm -v` |
| Docker + Docker Compose | Docker Desktop (Compose v2) | Dùng để chạy PostgreSQL 16 |
| dotnet-ef | **10.x** (chỉ cần khi muốn thao tác migration thủ công) | Cài bên dưới |

---

## 5. Hướng dẫn cài đặt và chạy

Cần **3 terminal** mở song song: một cho database, một cho backend, một cho frontend.

### Bước 0 — Lấy mã nguồn

```bash
git clone https://github.com/ToanBan/ServiceBooking
cd ServiceBooking
```

### Bước 1 — Chạy database (terminal 1, tại thư mục gốc repo)

```bash
docker compose up -d
```

Lệnh này dựng PostgreSQL 16 với:

| Thông số | Giá trị |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `servicebooking` |
| Username | `postgres` |
| Password | `postgres` |

Kiểm tra container đã sẵn sàng trước khi sang bước 2:

```bash
docker compose ps
```

Chờ tới khi cột `STATUS` hiển thị `healthy` rồi mới chạy backend (backend tự migrate ngay khi khởi động, nếu database chưa lên sẽ báo lỗi kết nối).

Connection string tương ứng (đã khớp sẵn trong `backend/appsettings.json`):

```text
Host=localhost;Port=5432;Database=servicebooking;Username=postgres;Password=postgres
```

Dừng database: `docker compose down`. Xoá luôn dữ liệu: `docker compose down -v`.

### Bước 2 — Chạy backend (terminal 2, tại thư mục `backend/`)

```bash
cd backend
```

**Tạo file `appsettings.json`.** File này chứa connection string và JWT secret nên **đã bị `.gitignore` loại khỏi repo** — bạn phải tự tạo. Tạo file `backend/appsettings.json` với nội dung sau:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://localhost:3000"
    ]
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=servicebooking;Username=postgres;Password=postgres"
  },
  "Authentication": {
    "Issuer": "ServiceBooking",
    "Audience": "ServiceBookingClients",
    "AccessToken": {
      "SecretKey": "THAY_BANG_KHOA_NGAU_NHIEN_32_KY_TU",
      "ExpirationMinutes": 30
    },
    "RefreshToken": {
      "SecretKey": "THAY_BANG_KHOA_NGAU_NHIEN_32_KY_TU_KHAC",
      "ExpirationDays": 7
    }
  }
}
```

> **Lưu ý về khoá bí mật:** hai giá trị `SecretKey` ở trên là placeholder. Hãy thay bằng khoá ngẫu nhiên thật của bạn — JWT ký bằng HMAC-SHA256 nên khoá cần tối thiểu 32 ký tự. Sinh khoá bằng một trong hai lệnh sau và chạy **hai lần** để có hai khoá khác nhau:
>
> ```powershell
> [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```
>
> ```bash
> openssl rand -base64 32
> ```

Cài package và chạy:

```bash
dotnet restore
dotnet run --launch-profile http
```

Backend khởi động tại:

| Mục đích | Địa chỉ |
|---|---|
| API | `http://localhost:5036` |
| OpenAPI JSON (chỉ ở môi trường Development) | `http://localhost:5036/openapi/v1.json` |
| SignalR hub | `http://localhost:5036/hubs/bookings` |

Lần chạy đầu tiên backend sẽ **tự động chạy migration và seed dữ liệu mẫu** (`Program.cs` gọi `MigrateAsync()` rồi `DbSeeder.SeedAsync()`), nên bạn **không cần** chạy `dotnet ef database update` thủ công.

Kiểm tra backend đã lên:

```bash
curl http://localhost:5036/api/services?page=1
```

Nên trả về JSON có `items`, `totalCount`. Mở trình duyệt tới `http://localhost:5036/openapi/v1.json` cũng được.

#### Lệnh migration (chỉ khi cần)

```bash
dotnet ef migrations list                  # xem danh sách migration
dotnet ef database update                  # áp migration (thường không cần)
dotnet ef database drop --force            # xoá database để seed lại từ đầu
```

### Bước 3 — Chạy frontend (terminal 3, tại thư mục `frontend/`)

```bash
cd frontend
```

Tạo file cấu hình môi trường từ file mẫu:

```bash
cp .env.example .env.local
```

```powershell
Copy-Item .env.example .env.local      # Windows PowerShell
```

Nội dung `.env.example`:

```text
API_BASE_URL=http://localhost:5036
NEXT_PUBLIC_SIGNALR_HUB_URL=/hubs/bookings
```

Cài package và chạy:

```bash
npm install
npm run dev
```

Mở trình duyệt tại **`http://localhost:3000`**.


### Bước 4 — Kiểm tra nhanh

1. Mở `http://localhost:3000` → trang chủ hiển thị.
2. Đăng nhập `nguyenvana@gmail.com` / `Customer@123` → vào trang đặt lịch.
3. Đăng nhập `admin@servicebooking.com` / `Admin@123` → tự chuyển tới `/admin/bookings`.

### Chạy tất cả bằng Docker Compose?

**Không.** Repo hiện chỉ đóng gói **database** trong `docker-compose.yml` (service `db`), không có Dockerfile cho backend và frontend. Vì vậy lệnh duy nhất cần dùng là:

```bash
docker compose up -d
```

Sau đó chạy backend và frontend như bước 2 và bước 3.

---

## 6. Tài khoản demo

Dữ liệu được seed tự động khi backend khởi động lần đầu (nguồn: `backend/Data/DbSeeder.cs`).

| Vai trò | Họ tên | Email | Mật khẩu |
|---|---|---|---|
| **Admin** | Quản trị viên | `admin@servicebooking.com` | `Admin@123` |
| **Customer** | Nguyễn Văn A | `nguyenvana@gmail.com` | `Customer@123` |
| **Customer** | Trần Thị B | `tranthib@gmail.com` | `Customer@123` |

Sau khi đăng nhập, Admin được đưa tới `/admin/bookings`, Customer về trang chủ `/`.

Bạn cũng có thể tự đăng ký tài khoản Customer mới tại `/register`. Mật khẩu đăng ký phải dài hơn 8 ký tự và chứa ít nhất 1 chữ hoa, 1 chữ số và 1 ký tự `@` (ví dụ `Test@1234`).

---

## 7. Dữ liệu mẫu

Seed chạy **một lần duy nhất**: nếu bất kỳ bảng nào đã có dữ liệu thì `DbSeeder` thoát ngay, không ghi đè.

| Loại dữ liệu | Số lượng | Chi tiết |
|---|---|---|
| User | **3** | 1 Admin + 2 Customer (bảng ở mục 6) |
| Staff | **5** | 4 đang hoạt động (Ngộ Không, Bát Giới, Sa Ngộ Tịnh, Đường Tam Tạng) + 1 ngừng hoạt động (Bạch Long Mã) |
| Service | **6** | 5 đang hoạt động (thời lượng 30, 45, 60, 90, 120 phút; giá 100.000 – 750.000) + 1 tạm khóa (Dịch vụ tạm khóa) |
| WorkSchedule | **56** | Mỗi nhân viên đang hoạt động (4) × 7 ngày (hôm qua → +5) × 2 ca: `08:00–12:00` và `13:00–17:00` |
| Booking | **10** | 3 `Pending`, 3 `Confirmed`, 2 `Completed`, 2 `Cancelled`; mã `BK-SEED-001` → `BK-SEED-010` |

Ngày của ca làm việc được tính theo múi giờ nghiệp vụ (UTC+7) tại thời điểm seed, nên **chạy seed lại vào ngày khác sẽ có ca ở ngày khác**. Hai booking `Completed` nằm ở ngày hôm qua; các booking còn lại nằm ở ngày hôm nay và các ngày kế tiếp.

Bản ghi `Cancelled` luôn có `CancellationReason`, ví dụ "Khách hàng thay đổi kế hoạch."

### Cách reset dữ liệu

Xoá database rồi để backend tạo lại từ đầu:

```bash
cd backend
dotnet ef database drop --force
dotnet run --launch-profile http
```

Hoặc xoá cả volume Docker (mạnh hơn, xoá sạch mọi thứ trong PostgreSQL):

```bash
docker compose down -v
docker compose up -d
```

Sau đó chạy lại backend — migration và seed sẽ chạy lại.

---

## 8. Màn hình

Route được lấy từ cấu trúc `frontend/src/app/`. Ba route `/booking`, `/my-bookings`, `/admin/*` được chặn ở tầng server bởi `frontend/src/proxy.ts` (Next.js middleware): nếu không có cookie `refreshToken` thì chuyển hướng về `/login?redirect=<đường-dẫn-cũ>`.

| Route | Vai trò | Màn hình làm gì |
|---|---|---|
| `/` | Công khai | Trang chủ giới thiệu hệ thống, có liên kết tới dịch vụ, đặt lịch, đăng nhập |
| `/login` | Công khai | Form đăng nhập. Sau khi thành công, đọc tham số `redirect` (đã kiểm tra an toàn bằng `safeRedirectPath`) hoặc đưa về trang mặc định theo vai trò |
| `/register` | Công khai | Form đăng ký tài khoản Customer |
| `/services` | Công khai | Danh sách dịch vụ kèm thời lượng và giá |
| `/booking` | Đăng nhập (Customer) | Chọn dịch vụ → nhân viên → ngày → hệ thống gọi `available-slots` và hiển thị các khung giờ còn trống → xác nhận đặt lịch |
| `/my-bookings` | Đăng nhập (Customer) | Danh sách lịch hẹn của chính mình, có phân trang, lọc theo trạng thái và ngày; hủy lịch kèm lý do |
| `/admin/bookings` | Đăng nhập (Admin) | Bảng toàn bộ lịch hẹn: tìm kiếm, lọc theo trạng thái và ngày, phân trang; xác nhận (Confirmed) hoặc hoàn tất (Completed) |
| `/admin/services` | Đăng nhập (Admin) | Danh sách dịch vụ, thêm mới, sửa, bật/tắt trạng thái hoạt động, tìm kiếm phía client, phân trang |
| `/admin/staff` | Đăng nhập (Admin) | Danh sách nhân viên (lọc theo trạng thái hoạt động), xem ca làm việc của từng nhân viên, thêm ca mới |
| `/admin/staff/[staffId]/schedules` | Đăng nhập (Admin) | Trang riêng xem và thêm ca làm việc cho một nhân viên |
| `/forbidden` | Công khai | Trang báo lỗi 403 khi Customer cố truy cập khu vực Admin |

Phân quyền phía frontend do `frontend/src/components/auth/admin-guard.tsx` đảm nhiệm: nếu người dùng không phải Admin thì chuyển tới `/forbidden`. Đây chỉ là lớp bảo vệ giao diện — **backend vẫn kiểm tra quyền độc lập** (xem mục 11).

Ứng dụng có **realtime**: hook `frontend/src/hooks/use-booking-realtime.ts` kết nối SignalR tới `/hubs/bookings` và tự làm mới danh sách khi nhận sự kiện `BookingCreated`, `BookingCancelled`, `BookingStatusChanged`.

---

## 9. CÁC API ĐÃ HOÀN THÀNH

Base URL: `http://localhost:5036`. Bảng dưới lấy trực tiếp từ 4 controller trong `backend/Controllers/`.

### 9.1 Danh sách endpoint

| Method | Đường dẫn | Quyền truy cập | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Công khai | Đăng ký tài khoản Customer mới |
| POST | `/api/auth/login` | Công khai | Đăng nhập; ghi cookie `accessToken` + `refreshToken` |
| POST | `/api/auth/logout` | Công khai | Đăng xuất: xoá refresh token trong DB, thu hồi access token, xoá cookie |
| POST | `/api/auth/refresh-token` | Công khai (cần cookie `refreshToken`) | Cấp lại cặp token mới |
| GET | `/api/auth/me` | Đăng nhập | Thông tin người dùng đang đăng nhập |
| GET | `/api/services?page=` | Công khai | Danh sách dịch vụ (phân trang, 10 bản ghi/trang) |
| GET | `/api/services/{id}` | Công khai | Chi tiết một dịch vụ |
| POST | `/api/services` | **Admin** | Tạo dịch vụ mới |
| PUT | `/api/services/{id}` | **Admin** | Cập nhật dịch vụ |
| GET | `/api/staffs?isActive=&page=` | Công khai | Danh sách nhân viên (phân trang, lọc theo trạng thái) |
| GET | `/api/staffs/{id}/schedules?from=&to=` | Công khai | Ca làm việc của một nhân viên trong khoảng ngày |
| POST | `/api/staffs/{id}/schedules` | **Admin** | Thêm ca làm việc cho nhân viên |
| GET | `/api/bookings/available-slots?serviceId=&staffId=&date=` | Đăng nhập | Danh sách khung giờ trống của nhân viên theo dịch vụ và ngày |
| POST | `/api/bookings` | **Customer** | Tạo booking; backend tự tính `EndTime` |
| GET | `/api/bookings?page=&status=&search=&date=` | **Admin** | Toàn bộ booking, lọc theo trạng thái / từ khoá / ngày |
| GET | `/api/bookings/my-bookings?page=&status=&date=` | **Customer** | Booking của chính mình |
| PATCH | `/api/bookings/{id}/status` | **Admin** | Đổi trạng thái sang `Confirmed` hoặc `Completed` |
| POST | `/api/bookings/{id}/cancel` | **Customer** | Hủy booking của chính mình, bắt buộc kèm lý do |

Ghi chú về quyền:

- "Đăng nhập" nghĩa là chỉ cần token hợp lệ, không phân biệt vai trò (`available-slots` dùng chung cho cả hai vai trò).
- Toàn bộ `BookingController` được đánh dấu `[Authorize]` ở cấp class, các action ghi thêm `[Authorize(Roles = ...)]` để siết quyền.
- `GET /api/services`, `GET /api/staffs`, `GET /api/staffs/{id}/schedules` là công khai nên có thể gọi mà không cần token.

### 9.2 Định dạng phân trang

Các endpoint danh sách trả về cùng một cấu trúc:

```json
{
  "items": [],
  "totalCount": 0,
  "offset": 0,
  "limit": 10,
  "totalPages": 0,
  "hasNext": false,
  "hasPrevious": false
}
```

Tham số `page` bắt đầu từ 1. Kích thước trang cố định là **10** bản ghi (`DefaultLimit` trong controller); API chưa nhận tham số `limit` từ client.
