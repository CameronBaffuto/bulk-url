const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/check', async (req, res) => {
  try {
    const urls = req.body.urls.split(/[\n,]+/);
    const results = await Promise.all(urls.map(checkRedirection));
    res.json(results);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

async function checkRedirection(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

    const status = response.status();
    const statusCodeDescriptions = {
        100: 'Continue',
        101: 'Switching Protocols',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        421: 'Misdirected Request',
        426: 'Upgrade Required',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };
    const statusDescription = statusCodeDescriptions[status] || 'Unknown Status';
    const redirectedUrl = response.url() !== url ? response.url() : null;

    await browser.close();

    return { url, status: `${status} - ${statusDescription}`, redirectedUrl };
  } catch (error) {
    console.error(`Error occurred while checking ${url}:`, error.message);
    return { url, status: 'Error', redirectedUrl: null, errorMessage: error.message };
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
