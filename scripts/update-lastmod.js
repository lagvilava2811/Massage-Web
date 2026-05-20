const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error('sitemap.xml not found at:', sitemapPath);
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];

let content = fs.readFileSync(sitemapPath, 'utf8');

// Replace any <lastmod>YYYY-MM-DD</lastmod> with today's date
const updatedContent = content.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

fs.writeFileSync(sitemapPath, updatedContent, 'utf8');
console.log(`Updated all sitemap lastmod tags to: ${today}`);
