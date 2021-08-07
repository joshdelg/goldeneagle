const express = require("express");
const cheerio = require('cheerio');
const got = require('got');

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

app.get('/api/getSchoolMeets', (req, res) => {

    // This year's Hole in the Wall
    res.json({ meetId: 179877});
});