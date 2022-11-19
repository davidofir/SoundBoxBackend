# merchnow-api-node

Unoffical module to fetch merch from Merchnow"s API.

## Installation

`npm i merchnow-api-node`

## Usage

```
const { getCatalog } = require("merchnow-api-node")

const fetch = async string => {
    const results = await getCatalog(string)
    console.log("Catalog")
    console.log(results)
}

fetch("artist")
```

You can also pass a offset as a second parameter, if limit equals items returned

## Why?

Merchnow seems to use a cms api which returns a html string. This module parses the html to useable object using `node-html-parser`

### Before

```
{
    "Content":"<!-- for infinate scroll -->  <div class=\"col-lg-3 col-md-3 col-sm-4 col-xs-6\">    <!-- used for product lists on pages --><!-- images are different sizes - setting width to be all the same and adding padding in percentages (responsive) to images on bottom to preserve aspect ratio --><div class=\"product-list-item\" >  <div class=\"text-center\">          <span class=\"image-decoration\">Sale</span>          <a href=\"/products/v2/240374/mountain-black\">                                  <picture>      <source media=\"(min-width: 800px)\"......."
    "NumberOfItems":0,
    "ItemsReturned":5,
    "Enabled":false,
    "Offset":17,
    "Limit":16
}
```

### After

```
{
    "Content":
    [
        {
            name: "Glow Black"
            decorations: ["Sale"],
            description: [{content: "Hail The Sun", tag: "strong"}, {content: "$25", tag: "span"}...],
            images: {sm: "url", md: "url", lg: "url", xl: "url"...},
            url: "merch-url"
        },
        {
            ...
        },
    ],
    "NumberOfItems":0,
    "ItemsReturned":5,
    "Enabled":false,
    "Offset":17,
    "Limit":16
}
```
