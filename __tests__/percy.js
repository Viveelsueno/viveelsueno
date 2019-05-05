require('regenerator-runtime/runtime');
const puppeteer = require('puppeteer');
const {percySnapshot} = require('@percy/puppeteer');

const URLS = [
  '/',
  '/'
];
const BASE_URL = process.env.DEPLOY_URL || 'http://localhost:3000';

// eslint-disable-next-line no-undef
describe('Percy', function() {
  let browser;
  let page;

  // eslint-disable-next-line no-undef
  beforeAll(async function () {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  // eslint-disable-next-line no-undef
  it('', async function() {
    for (let i = 0; i < URLS.length; i++) {
      await page.goto(`${BASE_URL}${URLS[i]}`);
      await percySnapshot(page, URLS[i]);
    }
  });

  // eslint-disable-next-line no-undef
  afterAll(async function () {
    await browser.close();
  });
});
