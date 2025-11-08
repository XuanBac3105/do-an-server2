# User Module Tests

Thư mục này chứa các bài test cho module User.

## Cấu trúc Test

### 1. user.controller.spec.ts
Test cho UserController, bao gồm:

#### getAllUsers
- ✅ Lấy danh sách người dùng thành công
- ✅ Tìm kiếm người dùng theo từ khóa
- ✅ Lọc người dùng theo trạng thái active
- ✅ Sắp xếp theo các trường khác nhau (fullName, email, phoneNumber, createdAt)
- ✅ Trả về danh sách rỗng khi không tìm thấy
- ✅ Xử lý lỗi từ service

#### getUser
- ✅ Lấy thông tin người dùng theo ID thành công
- ✅ Ném lỗi khi không tìm thấy người dùng
- ✅ Lấy người dùng với các vai trò khác nhau
- ✅ Xử lý lỗi từ service

#### deActiveUser
- ✅ Vô hiệu hóa người dùng thành công
- ✅ Ném lỗi khi không tìm thấy người dùng
- ✅ Xử lý nhiều lần vô hiệu hóa
- ✅ Xử lý lỗi từ service

#### activateUser
- ✅ Kích hoạt người dùng thành công
- ✅ Ném lỗi khi không tìm thấy người dùng
- ✅ Xử lý nhiều lần kích hoạt
- ✅ Xử lý lỗi từ service

### 2. user.service.spec.ts
Test cho UserService, bao gồm:

#### getAllUsers
- ✅ Lấy danh sách người dùng với phân trang
- ✅ Lọc theo trạng thái isActive
- ✅ Tìm kiếm theo fullName, email, phoneNumber
- ✅ Sắp xếp theo các trường khác nhau
- ✅ Xử lý phân trang chính xác
- ✅ Kết hợp filter, search và sorting
- ✅ Trả về danh sách rỗng
- ✅ Xử lý lỗi từ repository

#### getUser
- ✅ Lấy người dùng theo ID thành công
- ✅ Ném lỗi UnprocessableEntityException khi không tìm thấy
- ✅ Xử lý lỗi từ repository

#### deactiveUser
- ✅ Vô hiệu hóa người dùng thành công
- ✅ Ném lỗi khi không tìm thấy người dùng
- ✅ Vô hiệu hóa người dùng đã inactive
- ✅ Xử lý lỗi từ repository

#### activateUser
- ✅ Kích hoạt người dùng thành công
- ✅ Ném lỗi khi không tìm thấy người dùng
- ✅ Kích hoạt người dùng đã active
- ✅ Xử lý lỗi từ repository

### 3. user.repo.spec.ts
Test cho UserRepo, bao gồm:

#### count
- ✅ Đếm tất cả người dùng
- ✅ Đếm với filter
- ✅ Đếm theo role
- ✅ Đếm với search filter
- ✅ Đếm với filter phức tạp
- ✅ Trả về 0 khi không tìm thấy
- ✅ Xử lý lỗi database

#### findMany
- ✅ Tìm người dùng với các tham số mặc định
- ✅ Tìm với filter
- ✅ Sắp xếp theo các trường khác nhau
- ✅ Xử lý phân trang (skip, take)
- ✅ Lọc theo role
- ✅ Tìm kiếm theo từ khóa
- ✅ Filter phức tạp
- ✅ Trả về mảng rỗng
- ✅ Xử lý các trường hợp đặc biệt (take = 0, skip lớn)
- ✅ Xử lý lỗi database

## Chạy Test

### Chạy tất cả test
```bash
npm test
```

### Chạy test cho module user
```bash
npm test -- user
```

### Chạy test với coverage
```bash
npm test -- --coverage
```

### Chạy test ở chế độ watch
```bash
npm test -- --watch
```

## Mock Objects

Các test sử dụng mock objects để tách biệt các layer:
- **Controller tests**: Mock `IUserService` và override `RoleGuard` (do RoleGuard có dependency vào SharedUserRepo)
- **Service tests**: Mock `IUserRepo` và `SharedUserRepo`
- **Repository tests**: Mock `PrismaService`

## Important Notes

### Controller Tests
Controller tests cần override `RoleGuard` vì:
- `UserController` sử dụng `@UseGuards(RoleGuard)` cho tất cả endpoints
- `RoleGuard` có dependency injection `SharedUserRepo`
- Trong unit test, chúng ta chỉ muốn test controller logic, không phải guard logic
- Solution: Sử dụng `.overrideGuard(RoleGuard).useValue(mockRoleGuard)` trong test setup

```typescript
.overrideGuard(RoleGuard)
.useValue(mockRoleGuard)
```

## Best Practices

1. **Isolated Tests**: Mỗi test case độc lập và không phụ thuộc vào test khác
2. **Clear Naming**: Tên test mô tả rõ ràng hành vi được test
3. **AAA Pattern**: Arrange-Act-Assert pattern được sử dụng nhất quán
4. **Mock Cleanup**: `afterEach` hook đảm bảo mock được reset sau mỗi test
5. **Error Handling**: Test cả trường hợp thành công và lỗi
6. **Edge Cases**: Test các trường hợp biên và đặc biệt

## Coverage Goals

Mục tiêu coverage cho module user:
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%
