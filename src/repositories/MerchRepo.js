const puppeteer = require('puppeteer');

async function getHotTopicMerch(artistName) {
  let results = [];
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable sandbox if necessary
  });
  const page = await browser.newPage();
  await page.goto(`https://www.hottopic.com/search?q=${artistName}&search-button=&lang=default`);

  
    // Extract all img tags from the page
    const imgTags = await page.evaluate((artistName) => {
      const images = Array.from(document.querySelectorAll('img')).filter((img)=>img.alt.toLowerCase().includes(artistName.toLowerCase()) && img.src.includes("_hi?"));
      return images.map((img) => img.src);
    },artistName);
  
    const link = await page.evaluate((artistName) => {
      const images = Array.from(document.querySelectorAll('a.link'))
  
      return images.map((link)=>link.href).filter(source => source.includes( artistName.toLowerCase().replace(/ /g,"-")))
    },artistName);
  
    const productTitles = await (await page.$$eval('.product-tile', elements => elements.map(el => el.innerText))).filter((text)=>text.toLowerCase().includes(artistName.toLowerCase()));
    let foundContent = productTitles.map(item=>item.split("\n"));
    foundContent.map((content,index)=>results = [...results,{
      name:content[0],
      price:content[1],
      image:imgTags[index],
      link:link[index]
    }])
    //console.log(results)
    await browser.close();
    return results;
  }
module.exports = {
    getHotTopicMerch,
}