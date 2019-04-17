const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const cache = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.instagram.com/viveelsueno/');
  const sources = await page.evaluate(() => {
    const images = document.querySelectorAll('article img');
    const data = [];

    for (let i = 0; i < images.length; i++) {
      data.push(images[i].currentSrc);
    }

    return data;
  });

  // eslint-disable-next-line
  await new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, './site/static/instagram.json'), JSON.stringify({sources}), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await browser.close();
};

cache();
