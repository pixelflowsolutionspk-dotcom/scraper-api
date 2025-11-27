import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { Parser as Json2csvParser } from "json2csv";

const app = express();
const PORT = process.env.PORT || 3000;

// SCRAPER FUNCTION
async function scrapeProducts(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(response.data);
  const products = [];

  $(".product").each((i, el) => {
    const name = $(el).find(".title").text().trim();
    const price = $(el).find(".price").text().trim();
    const img = $(el).find("img").attr("src");

    products.push({ name, price, img });
  });

  return products;
}

// BASIC JSON RESPONSE
app.get("/get-products", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.json({ error: "URL missing" });

    const products = await scrapeProducts(url);
    res.json(products);

  } catch (err) {
    res.json({ error: err.message });
  }
});

// DOWNLOAD JSON FILE
app.get("/get-products-json", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.json({ error: "URL missing" });

    const products = await scrapeProducts(url);

    res.setHeader("Content-Disposition", "attachment; filename=products.json");
    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(products, null, 2));

  } catch (err) {
    res.json({ error: err.message });
  }
});

// DOWNLOAD CSV FILE
app.get("/get-products-csv", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.json({ error: "URL missing" });

    const products = await scrapeProducts(url);

    const parser = new Json2csvParser();
    const csv = parser.parse(products);

    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.setHeader("Content-Type", "text/csv");

    res.send(csv);

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
