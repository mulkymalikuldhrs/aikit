# Setup AIKit Without npm link

Nếu bạn gặp lỗi permission với `npm link`, có thể sử dụng các cách sau:

## Cách 1: Sử dụng npx (Recommended)

Không cần `npm link`, chỉ cần sử dụng `npx`:

```bash
# Build project
npm run build

# Sử dụng với npx
npx aikit init
npx aikit status
npx aikit skills list
```

## Cách 2: Sử dụng node trực tiếp

```bash
# Build project
npm run build

# Sử dụng với node
node dist/cli.js init
node dist/cli.js status
node dist/cli.js skills list
```

## Cách 3: Tạo alias trong shell

Thêm vào `~/.zshrc` hoặc `~/.bashrc`:

```bash
alias aikit='node /Users/phannguyenthanhduy/code/TDSolution/aikit/aikit/dist/cli.js'
```

Sau đó:
```bash
source ~/.zshrc
aikit init
aikit status
```

## Cách 4: Sử dụng npm link với sudo (Not Recommended)

```bash
sudo npm link
```

**Lưu ý**: Không nên dùng sudo với npm vì có thể gây vấn đề permissions.

## Cách 5: Sử dụng npm prefix (Better)

```bash
# Set npm prefix để tránh cần sudo
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Thêm vào PATH (thêm vào ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Sau đó link
npm link
```

## Recommended Workflow

**Option A: Development (Recommended)**
```bash
# Trong aikit directory
npm run build

# Sử dụng với npx
npx aikit init
npx aikit install
```

**Option B: Production**
```bash
# Install globally với npm prefix
npm config set prefix '~/.npm-global'
npm link

# Hoặc publish to npm và install
npm publish
npm install -g aikit
```

## Quick Test

Sau khi setup, test với:

```bash
# Test với npx
npx aikit status

# Hoặc với node
node dist/cli.js status

# Hoặc với alias (nếu đã setup)
aikit status
```

## Troubleshooting

### Lỗi "command not found"
- Đảm bảo đã build: `npm run build`
- Sử dụng `npx aikit` hoặc `node dist/cli.js`

### Lỗi permission
- Sử dụng `npx` thay vì `npm link`
- Hoặc setup npm prefix như trên

### Lỗi module not found
- Đảm bảo đã chạy `npm install`
- Đảm bảo đã build: `npm run build`






