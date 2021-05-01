const { v4: uuidv4 } = require('uuid');

const mysql = require('mysql');
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

let currentDate = new Date();

let currentMonth = (currentDate.getMonth() + 1) <= 9 ? '0' + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1);
let correctDate = currentDate.getDate() <= 9 ? '0' + currentDate.getDate() : currentDate.getDate();
let todaysDate = currentDate.getFullYear() + "-" + currentMonth + "-" + correctDate;
//console.log(todaysDate);
//todaysDate = '2021-04-28';

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.API_KEY);


// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
const locations = ['London', 'Birmingham', 'Liverpool', 'Manchester', 'Cambridge', 'Oxford'];
const newscategory = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

const topHeadlinesResults = locations.map((location) => {

    newsapi.v2.topHeadlines({
        language: 'en',
        country: 'gb',
        q: location
    }).then(response => {
        console.log(response.status);
        const articles = response.articles.map((article) => {

            const sqlInsert = `INSERT INTO coeusnews.article_location(id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, article_location, counter, source) SELECT * FROM (SELECT "${uuidv4()}" AS id,"${article.author}" AS author_name, "${article.title}" AS title, "${article.description}" AS description," " AS category,"${article.content}" AS article_text, "${article.url}" AS article_URL, "${article.urlToImage}" AS article_image_URL, "${article.publishedAt}" AS published_at, "${location}" AS article_location,10000 as counter, "everything" as source) AS tmp WHERE NOT EXISTS(SELECT id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, article_location, counter, source from coeusnews.article_location a WHERE a.title = "${article.title}" AND a.author_name = "${article.author}");`
            db.query(sqlInsert, (err, result) => {
                //console.log(err);
                //console.log(sqlInsert);
                //if (err) throw err;
                //console.log("Number of records inserted: " + result.affectedRows);
            });
        });
    });
});

const categoryResults = newscategory.map((category) => {

    newsapi.v2.topHeadlines({
        language: 'en',
        country: 'gb',
        category: category
    }).then(response => {
        //console.log(response.status);
        const articles = response.articles.map((article) => {

            const sqlInsert = `INSERT INTO coeusnews.article_category(id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, source) SELECT * FROM (SELECT "${uuidv4()}" AS id,"${article.author}" AS author_name, "${article.title}" AS title, "${article.description}" AS description,"${category}" AS category,"${article.content}" AS article_text, "${article.url}" AS article_URL, "${article.urlToImage}" AS article_image_URL, "${article.publishedAt}" AS published_at, "topHeadlines" as source) AS tmp WHERE NOT EXISTS(SELECT id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, source FROM coeusnews.article_category a WHERE a.title = "${article.title}" AND a.author_name = "${article.author}");`
            db.query(sqlInsert, (err, result) => {
                //console.log(err);
                //console.log(sqlInsert);
                //if (err) throw err;
                //console.log("Number of records inserted: " + result.affectedRows);
            });
        });
    });
});

// });
// To query /v2/everything
// You must include at least one q, source, or domain

const locationResults = locations.map(async (location) => {
    let response = await newsapi.v2.everything({
        q: location,
        //sources: 'telegraph',
        domains: 'telegraph.co.uk, bbc.co.uk',
        // from: '2017-12-01',
        // to: '2017-12-12',
        language: 'en',
        sortBy: 'publishedAt',
        page: 2
    });
    const articles = response.articles.map((article) => {
        const sqlInsert = `INSERT INTO coeusnews.article_location(id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, article_location, source) SELECT * FROM (SELECT "${uuidv4()}" AS id,"${article.author}" AS author_name, "${article.title}" AS title, "${article.description}" AS description," " AS category,"${article.content}" AS article_text, "${article.url}" AS article_URL, "${article.urlToImage}" AS article_image_URL, "${article.publishedAt}" AS published_at, "${location}" AS article_location, "everything" as source) AS tmp WHERE NOT EXISTS(SELECT id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, article_location, source from coeusnews.article_location a WHERE a.title = "${article.title}" AND a.author_name = "${article.author}");`
        db.query(sqlInsert, (err, result) => {
            //console.log(err);
            //console.log(sqlInsert);
            //if (err) throw err;
            //console.log("Number of records inserted: " + result.affectedRows);
        });
    });

});

const testCountResults = () => {
    const getInsertResults = function () {
        dateStr = todaysDate;
        return new Promise(function (resolve, reject) {
            db.query(
                `SELECT * FROM coeusnews.article_location WHERE updated_at LIKE "${dateStr}%";`,
                function (err, rows) {
                    if (rows === undefined) {
                        reject(new Error("Error rows is undefined"));
                    } else {
                        resolve(rows);
                    }
                }
            )
        }
        )
    }

    let count = getInsertResults()
        .then(function (results) {
            return results.length;
        })
        .catch(function (err) {
            //console.log("Promise rejection error: " + err);
        })

    return count === undefined ? "No Rows inserted" : "Rows inserted";
}

module.exports = {
    testCountResults
};
