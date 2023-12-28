const puppeteer = require('puppeteer');

exports.generatePdf = async (pk) => {
    console.log('generating pdf');
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/firefox',
        args: ['--no-sandbox', "--disabled-setupid-sandbox"]
    }).catch((err) => {
        console.log(err);
    });
    console.log('browser launched');
    const page = await browser.newPage();
    await page.goto(`${__domain__}lab/show_invoice.html?pk=${pk}`, {
        waitUntil: 'networkidle2',
    });
    console.log('page loaded');
    // wait 4 seconds for the page to load
    await page.waitForTimeout(5000);
    const pdf = await page.pdf({ format: 'A4', printBackground: true, path: 'invoice.pdf' });
    await browser.close();
    console.log('pdf generated');
    return pdf;


}