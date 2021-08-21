const express = require('express');
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();

// Body parsing
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({message: "Hello, world!"});
});

const getAverageTime = async (athleteId, year) => {

    try {
        // ! Fix so returns average time up to that point
        const response = await got(`https://www.athletic.net/CrossCountry/Athlete.aspx?AID=${athleteId}`);
        const $ = cheerio.load(response.body);
        const allTimes = $(`div[id*="S-${year}"]`).children().last();

        let season5kTable;
        allTimes.children().each((i, el) => {
            if(el.name === 'h5' && $(el).text() === '5,000 Meters') {
                season5kTable = $(el).next();
            }
        })

        const seasonText = season5kTable.text();
        /*const removedMeet = 'Bellevue Cross Country Invite';
        const meetIndex = seasonText.indexOf(removedMeet);
        const p1 = seasonText.substr(0, meetIndex - 17);
        const p2 = seasonText.substr(meetIndex);
        let times = (p1 + p2).match(/[0-9]+:[0-9]+/g);*/
        let times = seasonText.match(/[0-9]+:[0-9]+/g);

        let timesSeconds = times.map(t => parseInt(t.split(":")[0]) * 60 + parseInt(t.split(":")[1]));
        let averageTimeSeconds = timesSeconds.reduce((agg, val) => agg + val) / timesSeconds.length;
        let avgTimeReadable = `${Math.floor(averageTimeSeconds / 60)}:${Math.round(averageTimeSeconds % 60)}`;
        //console.log("from function", averageTimeSeconds);
        return averageTimeSeconds;
    } catch (err) {
        console.log("There was an error in avg time: ", err);
        return null;
    }
}

app.post("/api/getAthleteData", (req, res) => {

    const athleteUrl = req.body.athleteUrl;
    const year = req.body.year;

    let athleteData = {
        athleteUrl: athleteUrl,
        year: year
    };

    got(athleteUrl).then(response => {

        const $ = cheerio.load(response.body);
        const athleteId = ((athleteUrl.match(/AID=[0-9]+/g))[0]).substring(4);
        athleteData.athleteId = athleteId;

        // Get athlete name
        const athleteName = $('h2 span.mr-2').contents()[0].data;
        athleteData.athleteName = athleteName;

        // Get athlete school id, school name, and grade during the selected year
        const timesHeader = $(`div[id*="S-${year}"]`).children().first();
        if(timesHeader.length === 0) {
            res.status(500).json({err: "No athlete data could be found for that year. Try a different year."});
            return;
        }
        athleteData.schoolName = $('small a', timesHeader).text();
        athleteData.schoolId = $('small a', timesHeader).attr().href.split('?')[1].substring(9);
        athleteData.gradeYear = parseInt($('small span', timesHeader).text().match(/[0-9]+/g)[0]);

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

        athleteData.averageTime = averageTimeSeconds;

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
        console.log(err);
        res.status(500).json({err: "An error occured, please try a different link"});
        return;
    })

    // ! Return team ranking, grade now/year
});

app.post("/api/getMeetData", async (req, res) => {
    const meetUrl = req.body.meetUrl;
    const year = 2019;

    let meetData = {
        meetUrl: meetUrl,
        year: year
    };

    meetData.meetId = meetUrl.match(/meet[/][0-9]+/g)[0].substring(5);
    meetData.divId = meetUrl.match(/results[/][0-9]+/g)[0].substring(8);

    // Make request to get results json for meet and div ID
    // Also make request for meet data to get name and everything

    const meetResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'hw_varsity_2019.json'), 'utf-8')).results;

    meetData.meetResults = meetResults;
    meetData.numAthletes = meetResults.length;

    let promises = meetResults.map((athlete) => {
        return getAverageTime(athlete.AthleteID, year);
    });

    Promise.all(promises).then((avgTimes) => {
        // Append avg time to meet results
        avgTimes.forEach((time, index) => {
            meetData.meetResults[index].avgTime = time;
        });

        res.json(meetData);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({err: "An error occured. Please try a different link."});
    });



    // ! Return all data about the meet thats needed for analytics, getting avg time and all
    // ! Predicteing model will be done client side to avoid refreshes, so return data about avg time of every athlete
    // ! And whatever else is needed to make the regression line
});

app.get("/api/getSchoolAthletes", async(req, res) => {
    const schoolUrl = "https://www.athletic.net/CrossCountry/seasonbest?SchoolID=408&S=2020";

    const response = await got(schoolUrl);
    const $ = cheerio.load(response.body);
    $('div.distance h3').each((i, el) => {
        if($(el).text().includes("5,000 Meters")) {
            console.log($(el).next().text());
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});