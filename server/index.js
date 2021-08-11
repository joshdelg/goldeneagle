const express = require('express');
const got = require('got');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3001;

const app = express();

// Body parsing
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({message: "Hello, world!"});
})

app.post("/api/getAthleteData", (req, res) => {

    const athleteUrl = req.body.athleteUrl;

    let athleteData = {
        athleteUrl: athleteUrl
    };

    got(athleteUrl).then(response => {

        const $ = cheerio.load(response.body);
        const athleteId = ((athleteUrl.match(/AID=[0-9]+/g))[0]).substring(4);
        athleteData.athleteId = athleteId;

        // Get athlete name
        const athleteName = $('h2 span.mr-2').contents()[0].data;
        athleteData.athleteName = athleteName;
        res.json(athleteData);
    }).catch((err) => {
        res.status(500).json({msg: "Invalid URL"});
        return;
    })

    // ! Return avg time season/thus far, pr, sr, team ranking, name, id, school, grade now/year
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});