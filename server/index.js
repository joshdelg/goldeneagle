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
    const year = req.body.year;

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

        // Get athlete school and id
        const timesHeader = $(`div[id*="S-${year}"]`).children().first();
        athleteData.schoolName = $('small a', timesHeader).text();
        athleteData.schoolId = $('small a', timesHeader).attr().href.split('?')[1].substring(9);

        // Get avg season time
        const allTimes = $(`div[id*="S-${year}"]`).children().last();

        let season5kTable;
        allTimes.children().each((i, el) => {
            if(el.name === 'h5' && $(el).text() === '5,000 Meters') {
                season5kTable = $(el).next();
            }
        })

        const seasonText = season5kTable.text();
        /* Code to remove certain meet
        const removedMeet = 'NIKE HOLE IN THE WALL XC INVITATIONAL';
        const removedMeet = 'Bellevue Cross Country Invite';
        const meetIndex = seasonText.indexOf(removedMeet);
        const p1 = seasonText.substr(0, meetIndex - 17);
        const p2 = seasonText.substr(meetIndex);
        let times = (p1 + p2).match(/[0-9]+:[0-9]+/g); */

        let times = seasonText.match(/[0-9]+:[0-9]+/g);
        // console.log(times);

        let timesSeconds = times.map(t => parseInt(t.split(":")[0]) * 60 + parseInt(t.split(":")[1]));
        let averageTimeSeconds = timesSeconds.reduce((agg, val) => agg + val) / timesSeconds.length;
        //let avgTimeReadable = `${Math.floor(averageTimeSeconds / 60)}:${Math.round(averageTimeSeconds % 60)}`;
        // console.log(avgTimeReadable);

        athleteData.averagetime = averageTimeSeconds;

        // Get SR and PR
        const timeTables = $('table.histEvent');
        timeTables.each((i, el) => {
            if($(el).text().includes("5,000 Meters")) {
                $('tr.histSeason', el).each((index, el2) => {
                    if($(el2).text().includes(year)) {
                        athleteData.seasonRecord = $("[href*='/result/']", el2).text()
                    }
                    if($(el2).text().includes("PR")) {
                        athleteData.personalRecord = $("[href*='/result/']", el2).text()
                    }
                })
            }
        });

        res.json(athleteData);
    }).catch((err) => {
        res.status(500).json({msg: "An error occured"});
        return;
    })

    // ! Return avg time season/thus far, pr, sr, team ranking, name, id, school, grade now/year
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});