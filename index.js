const axios = require('axios');
const fs = require('fs');
const colors = require('colors');

class NetflixCookieChecker {
    constructor() {
        this.baseURL = 'https://www.netflix.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
        this.validCookies = [];
    }

    parseCookieString(cookieString) {
        const cleanCookie = cookieString.split('|')[0].trim();
        const cookies = {};
        cleanCookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        return cookies;
    }

    async checkCookie(cookieString, index) {
        try {
            const cookies = this.parseCookieString(cookieString);
            const cleanCookie = cookieString.split('|')[0].trim();
            
            const response = await axios.get(`${this.baseURL}/browse`, {
                headers: {
                    ...this.headers,
                    'Cookie': cleanCookie
                },
                timeout: 15000,
                maxRedirects: 5
            });

            const finalUrl = response.request?.res?.responseUrl || response.url;
            
            if (response.status === 200 && finalUrl.includes('/browse')) {
                this.validCookies.push(cleanCookie);
                
                const plan = await this.checkAccountPlan(cleanCookie);
                console.log(`[+] ${cleanCookie.substring(0, 50)}... | ${plan}`.green);
                
                return true;
            } else {
                console.log(`[-] ${cleanCookie.substring(0, 50)}...`.red);
                return false;
            }

        } catch (error) {
            console.log(`[-] ${cookieString.split('|')[0].trim().substring(0, 50)}... (erro: ${error.response?.status || 'timeout'})`.red);
            return false;
        }
    }

    async checkAccountPlan(cookieString) {
        try {
            const response = await axios.get(`${this.baseURL}/account`, {
                headers: {
                    ...this.headers,
                    'Cookie': cookieString
                },
                timeout: 15000,
                maxRedirects: 5
            });

            if (response.status === 200) {
                const html = response.data;
                const planMatch = html.match(/<h3[^>]*data-uia="account-overview-page\+membership-card\+title"[^>]*class="[^"]*"[^>]*>([^<]+)<\/h3>/i);
                
                if (planMatch && planMatch[1]) {
                    return planMatch[1].trim();
                } else {
                    return 'unknown_plan';
                }
            } else {
                return 'unknown_plan';
            }
        } catch (error) {
            return 'unknown_plan';
        }
    }

    analyzeResponse(htmlContent, statusCode, finalUrl) {
        if (statusCode === 200) {
            if (finalUrl && (finalUrl.includes('/browse') || finalUrl.includes('/profile'))) {
                return true;
            }
        }
        return false;
    }

    async checkFromFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const cookies = content.split('\n').filter(line => line.trim());
            
            console.log(`\n[#] ${cookies.length} cookies carregados...\n`.cyan);
            
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                await this.checkCookie(cookie, i + 1);
                
                if (i < cookies.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            if (this.validCookies.length > 0) {
                fs.writeFileSync('valids.txt', this.validCookies.join('\n'));
                console.log(`\n[@] ${this.validCookies.length} cookies válidos salvos em valids.txt`.yellow);
            } else {
                console.log(`\n[-] Nenhum cookie válido encontrado`.red);
            }  
        } catch (error) {
            console.error('[-] Erro ao ler arquivo:', error.message);
        }
    }
}

async function main() {
    const checker = new NetflixCookieChecker();
    await checker.checkFromFile('cookies.txt');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = NetflixCookieChecker;