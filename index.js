import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/get-products", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.json({ error: "URL missing" });

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(response.data);

    const products = [];

    $(".product").each((i, el) => {
      const name = $(el).find(".title").text().trim();
      const price = $(el).find(".price").text().trim();
      const img = $(el).find("img").attr("src");

      products.push({ name, price, img });
    });

    res.json(products);

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
