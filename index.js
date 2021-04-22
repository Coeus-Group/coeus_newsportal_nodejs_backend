//import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require('uuid');

const mysql = require('mysql');
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE

})

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('8e053f46587441afae2c138e17006a58');


// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
const newscategory = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

const result = newscategory.map((category) => {

    newsapi.v2.topHeadlines({
        language: 'en',
        country: 'gb',
        category: category
    }).then(response => {
        console.log(response);
        const articles = response.articles.map((article) => {

            const sqlInsert = `INSERT INTO coeusnews.article_post(id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at) VALUES ("${uuidv4()}","${article.author}", "${article.title}", "${article.description}","${category}","${article.content}", "${article.url}", "${article.urlToImage}", "${article.publishedAt}");`
            db.query(sqlInsert, (err, result) => {
                console.log(err);
            });
        })

        /*
          {
            status: "ok",
            articles: [...]
          }
        */
    });
});
// });
// To query /v2/everything
// You must include at least one q, source, or domain

const locations = ['London', 'Birmingham', 'Liverpool', 'Manchester', 'Cambridge', 'Oxford'];
const res = locations.map((location) => {

    newsapi.v2.everything({
        q: location,
        //sources: 'telegraph',
        domains: 'telegraph.co.uk',
        // from: '2017-12-01',
        // to: '2017-12-12',
        language: 'en',
        sortBy: 'relevancy',
        page: 2
    }).then(response => {
        console.log(response);
        const articles = response.articles.map((article) => {

            const sqlInsert = `INSERT INTO coeusnews.article_post(id, author_name, title, description, category, article_text, article_URL, article_image_URL, published_at, article_location) VALUES ("${uuidv4()}","${article.author}", "${article.title}", "${article.description}"," ","${article.content}", "${article.url}", "${article.urlToImage}", "${article.publishedAt}", "${location}");`
            db.query(sqlInsert, (err, result) => {
                console.log(err);
            });
        })
        /*
          {
            status: "ok",
            articles: [...]
          }
        */
    });
});
// To query sources
// All options are optional
// newsapi.v2.sources({
//   category: 'technology',
//   language: 'en',
//   country: 'us'
// }).then(response => {
//   console.log(response);
//   /*
//     {
//       status: "ok",
//       sources: [...]
//     }
//   */
// });

// app.listen(3001, () => {
//     console.log("Running on the port");
// });