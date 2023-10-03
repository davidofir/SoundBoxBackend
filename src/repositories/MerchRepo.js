const puppeteer = require('puppeteer');

async function getHotTopicMerch(artistName) {
  let results = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(`https://www.hottopic.com/search?q=${artistName}&search-button=&lang=default`);

  const imgTags = await page.evaluate((artistName) => {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => img.alt.toLowerCase().includes(artistName.toLowerCase()) && img.src.includes("_hi?"));
    return images.map(img => img.src);
  }, artistName);

  const links = await page.evaluate((artistName) => {
    return Array.from(document.querySelectorAll('a.link'))
      .map(link => link.href)
      .filter(href => href.includes(artistName.toLowerCase().replace(/ /g, "-")));
  }, artistName);

  const productDetails = await page.$$eval('.product-tile', elements => elements.map(el => {
    const nameElement = el.querySelector('.pdp-link .link');
    const priceElement = el.querySelector('.price .value');

    return {
      name: nameElement ? nameElement.innerText.trim() : null,
      price: priceElement ? priceElement.innerText.trim() : null
    };
  }));

  productDetails.forEach((detail, index) => {
    if (detail.name && detail.name.toLowerCase().includes(artistName.toLowerCase())) {
      results.push({
        name: detail.name,
        price: detail.price,
        image: imgTags[index],
        link: links[index]
      });
    }
  });

  await browser.close();
  return results;
}

module.exports = {
  getHotTopicMerch,
};
