# 编码标准 (CODE_STANDARDS.md)

## 文件信息
- 位置：`d:\Learn-Claude\GuanDan2\CODE_STANDARDS.md`
- 作用域：项目级
- 更新时间：2026-01-31

---

## 重要说明

⚠️ **此文件为项目级配置，不是全局配置！**

- 新建项目时需要**手动复制**此文件到项目根目录
- Claude Code 不会自动引用全局的 CODE_STANDARDS.md
- 在项目 CLAUDE.md 中需要**手动引用**此文件

---

## 通用规范

### 命名规范
- **变量/函数**：使用有意义的名称，描述清晰
- **常量**：使用 UPPER_SNAKE_CASE
- **类名**：使用 PascalCase
- **私有成员**：以下划线开头（如 `_privateMethod`）

### 代码风格
- 缩进：2 空格或 4 空格（保持项目一致性）
- 行宽：不超过 80-100 字符
- 注释：关键逻辑必须注释
- 空格：运算符左右加空格，逗号后加空格

### 错误处理
- 避免使用 `any`，优先使用具体类型或 `unknown`
- 异常必须处理或记录，不能吞掉
- 对用户输入进行验证和清理

---

## TypeScript 规范

### 文件类型
- `.ts` - 纯 TypeScript
- `.tsx` - TypeScript + JSX（React 组件）
- `.d.ts` - 类型定义文件

### 命名规范
- **文件**：camelCase 或 PascalCase（组件用 PascalCase）
- **函数/变量**：camelCase
- **接口/类型/枚举**：PascalCase
- **私有成员**：`_` 开头

```typescript
// ✅ 好的命名
function getUserById(id: string): User | null {
  const _userData = fetchUser(id);
  return _userData;
}

interface UserProfile {
  userId: string;
  name: string;
}

// ❌ 不好的命名
function getData(id: string) { }  // 太模糊
function _private(id: string) { } // 私有成员过于简短
```

### 函数规范
- 单个函数不超过 50 行
- 函数名使用动词（如 `getUser`、`createOrder`）
- 函数只做一件事

```typescript
// ✅ 好 - 单一职责
function validateEmail(email: string): boolean {
  return email.includes('@');
}

function sendWelcomeEmail(email: string): void {
  if (!validateEmail(email)) return;
  // 发送邮件逻辑
}

// ❌ 差 - 一个函数做太多事
function processUser(email: string) {
  validateEmail(email);
  sendEmail(email);
  saveToDatabase(email);
}
```

### 类型定义
- 优先使用 `unknown` 而不是 `any`
- 使用类型别名提高可读性

```typescript
// ✅ 好
type UserId = string;
type UserResponse = {
  id: UserId;
  name: string;
};

function processUser(id: UserId): UserResponse | null {
  const user = fetchUser(id);
  return user || null;
}

// ❌ 差
function processUser(id: any) {
  const user = fetchUser(id);
  return user || null;
}
```

### React 组件规范
- 组件使用 PascalCase
- Props 接口单独定义
- 使用 TypeScript 类型而非 any

```typescript
// ✅ 好
interface UserCardProps {
  user: User;
  onEdit?: (userId: string) => void;
}

function UserCard({ user, onEdit }: UserCardProps) {
  return <div>{user.name}</div>;
}

// ❌ 差
const UserCard = (props) => {  // 缺少类型定义
  return <div>{props.user.name}</div>;
};
```

---

## Python 规范

### 文件类型
- `.py` - Python 脚本
- `.pyi` - 类型存根文件（可选）

### 命名规范
- **模块**：小写字母，下划线分隔
- **类名**：PascalCase
- **函数/变量**：snake_case
- **常量**：UPPER_SNAKE_CASE
- **私有成员**：`_` 开头

```python
# ✅ 好的命名
class UserProfile:
    def __init__(self, user_id: str):
        self._user_id = user_id

    def get_user_name(self) -> str:
        return self._fetch_user_name()

# ❌ 不好的命名
class user_profile:
    def __init__(self, id):
        self.id = id  # 应该是 snake_case

USER_ID = "12345"  # ✅ 好的常量命名
```

### 函数规范
- 单个函数不超过 50 行
- 函数名使用动词（如 `get_user`、`create_order`）
- 函数只做一件事

```python
# ✅ 好 - 单一职责
def validate_email(email: str) -> bool:
    return '@' in email

def send_welcome_email(email: str) -> None:
    if not validate_email(email):
        return
    # 发送邮件逻辑

# ❌ 差 - 一个函数做太多事
def process_user(email):
    validate_email(email)
    send_email(email)
    save_to_database(email)
```

### 类型提示
- 优先使用具体类型而非 `Any`
- 使用类型别名提高可读性

```python
# ✅ 好
from typing import Optional

UserId = str
UserResponse = dict[str, object]

def get_user(user_id: UserId) -> Optional[UserResponse]:
    data = fetch_user(user_id)
    return data if data else None

# ❌ 差
from typing import Any

def get_user(user_id: Any) -> Any:
    data = fetch_user(user_id)
    return data
```

### 类规范
- 使用类型提示
- `__init__` 只做初始化，复杂逻辑放 `setup()` 方法

```python
# ✅ 好
class UserManager:
    def __init__(self, db: Database) -> None:
        self._db = db

    def setup(self) -> None:
        self._ensure_tables_exist()

# ❌ 差
class UserManager:
    def __init__(self, db):
        self._db = db
        # 在 __init__ 中放太多逻辑
```

---

## PHP 规范

### 文件类型
- `.php` - PHP 文件
- `.phpt` - PHP 测试文件

### 命名规范
- **类名**：PascalCase
- **方法/函数**：camelCase
- **变量/属性**：camelCase
- **常量**：UPPER_SNAKE_CASE
- **命名空间**：大写字母开头

```php
<?php

// ✅ 好的命名
class UserProfile
{
    private string $userId;
    private string $name;

    public function getUserId(): string
    {
        return $this->userId;
    }
}

// ❌ 不好的命名
class user_profile {
    private $id;  // 应该使用 camelCase
    public function get_id() {  // 应该使用 camelCase
        return $this->id;
    }
}
```

### 函数规范
- 单个函数不超过 50 行
- 函数名使用动词（如 `getUser`、`createOrder`）
- 函数只做一件事

```php
<?php

// ✅ 好 - 单一职责
function validateEmail(string $email): bool
{
    return strpos($email, '@') !== false;
}

function sendWelcomeEmail(string $email): void
{
    if (!validateEmail($email)) {
        return;
    }
    // 发送邮件逻辑
}

// ❌ 差 - 一个函数做太多事
function processUser(string $email)
{
    validateEmail($email);
    sendEmail($email);
    saveToDatabase($email);
}
```

### 类型提示
- PHP 7.4+ 强烈建议使用类型提示

```php
<?php

// ✅ 好
function getUser(int $userId): ?array
{
    $data = fetchUser($userId);
    return $data ?: null;
}

// ❌ 差（PHP 7.4 之前风格）
function getUser($userId) {
    $data = fetchUser($userId);
    return $data ? $data : null;
}
```

### 类规范
- 使用类型提示
- `__construct` 只做初始化

```php
<?php

// ✅ 好
class UserManager
{
    public function __construct(private Database $db)
    {
    }

    public function setup(): void
    {
        $this->ensureTablesExist();
    }
}

// ❌ 差
class UserManager
{
    public function __construct($db)
    {
        $this->db = $db;
        // 在构造函数中放太多逻辑
    }
}
```

---

## 检查清单

### 提交前检查
- [ ] 代码能正常运行
- [ ] 核心错误已修复
- [ ] 类型错误已解决
- [ ] 关键逻辑有注释
- [ ] 遵循项目编码规范

### 强制要求
- ✅ 函数不超过 50 行
- ✅ 函数名使用动词
- ✅ 函数只做一件事
- ✅ 不使用 `any`/`Any`（TypeScript/PHP）或 `Any`（Python）
- ✅ 异常被处理或记录

### 可接受但不强制
- ⚠️ 70%+ 测试覆盖率
- ⚠️ 零警告（核心错误必须修复）
- ⚠️ 完美的代码（"足够好"即可）

---

## 修改记录

| 日期 | 版本 | 修改内容 |
|------|------|---------|
| 2026-01-31 | v1.0 | 初始版本，添加 TypeScript、Python、PHP 规范 |
