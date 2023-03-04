const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const getBooks = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const books = $('article');
        const book_data = [];
        books.each(function () {
            title = $(this).find('h3 a').attr('title');
            price = $(this).find('.price_color').text();
            stock = $(this).find('.availability').text().trim();
            book_data.push({title, price, stock});
        });
        return book_data;
    } catch (err) {
        console.error(err);
    }
}

const getNextPage = async (currentPageUrl) => {
    const response = await axios.get(currentPageUrl);
    const $ = cheerio.load(response.data);

    const nextPagePath = $('li.next').find('a').attr('href');

    return nextPagePath;
}

(async () => {
    const book_data = [];
    const base_url = 'https://books.toscrape.com/catalogue/';
    let next_page = 'page-1.html';
    while (true) {
        const url = base_url + next_page;
        const books = await getBooks(url);
        book_data.push(... books);
        
        next_page = await getNextPage(url);

        if (!next_page){
            break;
        }
    }
    fs.writeFileSync('data.json', JSON.stringify(book_data, null, 4));
})();




