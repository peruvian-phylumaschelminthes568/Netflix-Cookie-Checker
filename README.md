# Netflix Cookie Checker

Simple Netflix cookie checker in Node.js to validate which cookies are working (live) and identify the account plan.

## 🚀 Features

- ✅ Check if Netflix cookies are valid (live/die)
- ✅ Identify account plan (Premium, Standard, Basic)
- ✅ Test cookies individually or in batch
- ✅ Save valid cookies to file
- ✅ Simple and direct CLI interface

## 📦 Installation

```bash
npm install
```

## 🎯 How to Use

### Check cookies from file

Create a `cookies.txt` file with one cookie per line:

```
NetflixId=v%3D3%26ct%3Dyour_cookie_here%26pg%3Dvalue%26ch%3Dvalue
NetflixId=ct%3Dyour_cookie_here%26ch%3Dvalue%26v%3D3%26pg%3Dvalue
```

Run:

```bash
node index.js
```

### 🍪 Cookie Format

The cookie must be in NetflixId format:

```
NetflixId=v%3D3%26ct%3D[value]%26pg%3D[value]%26ch%3D[value]
```

Or alternative format:

```
NetflixId=ct%3D[value]%26ch%3D[value]%26v%3D3%26pg%3D[value]
```

## 📊 Results

The checker displays:

- **[+] cookie... | Plan Premium** - Valid cookie and plan identified
- **[-] cookie...** - Invalid cookie (redirected to login)
- **[@] X valid cookies saved in valids.txt** - Final summary

### Output Example

```
[#] 2 cookies loaded...

[-] NetflixId=v%3D3%26ct%3Dinvalid_cookie...
[+] NetflixId=ct%3Dvalid_cookie... | Plan Premium

[@] 1 valid cookies saved in valids.txt
```

## ⚙️ How It Works

1. **Login Test**: Makes request to `/browse` using the cookie
2. **Verification**: If stays in `/browse` = live, if redirects to login = die
3. **Account Plan**: If live, accesses `/account` to identify the plan
4. **Save**: Valid cookies are saved in `valids.txt`

## 🔍 Plan Detection

The system looks for the element:
```html
<h3 data-uia="account-overview-page+membership-card+title">Plan Premium</h3>
```

If not found, returns `unknown_plan`.

## 📚 Dependencies

- **axios**: HTTP client for requests
- **colors**: Terminal colors

## 🔒 Security

- Doesn't store cookies permanently (only valid ones in valids.txt)
- Uses real User-Agent to avoid blocks
- Implements 15 seconds timeout
- Follows redirects automatically

## 📁 Generated Files

- `valids.txt` - Contains only the valid cookies found

## 👨‍💻 Author

akiralofy

## 📄 License

MIT
