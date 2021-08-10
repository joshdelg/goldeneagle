const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();

// Body parsing
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({message: "Hello, world!"});
})

app.post("/api/getAthleteData", (req, res) => {
    res.json({url: req.body.athleteUrl});
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});