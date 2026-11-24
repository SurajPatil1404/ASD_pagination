const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Already loaded the database (It's now a direct array)
const allArticles = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

app.get('/search', (req, res) => {
  const { name, limit, page } = req.query;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: "Search name parameter is required."
    });
  }

  let parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = 5;
  }

  let parsedPage = parseInt(page, 10);
  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  const searchTerm = name.trim().toLowerCase();
  const filteredArticles = allArticles.filter(article =>
    article.title && article.title.toLowerCase().includes(searchTerm)
  );

  const totalResults = filteredArticles.length;
  const totalPages = totalResults === 0 ? 0 : Math.ceil(totalResults / parsedLimit);
  const startIndex = (parsedPage - 1) * parsedLimit;
  const endIndex = startIndex + parsedLimit;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  return res.status(200).json({
    currentPage: parsedPage,
    totalPages: totalPages,
    totalResults: totalResults,
    articles: paginatedArticles
  });
});


  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  module.exports = {app}
