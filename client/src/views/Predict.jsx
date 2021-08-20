import { Box, Heading, Stack, Button, Input, Select, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import React, { useState } from "react";
import { secondsToString, stringToSeconds } from "../lib/timeLibs";
import regression from 'regression';

function Predict(props) {

    const [athleteData, setAthleteData] = useState(); // !in addition, SR, avg time that season/thus far, team ranking?, all time PR?
    const [meetData, setMeetData] = useState(); // !in addition, avg time drop/team time drop/num PRs after computation though in new dataset

    const [athleteUrl, setAthleteUrl] = useState("");
    const [meetUrl, setMeetUrl] = useState("");
    const [year, setYear] = useState("");

    const[predictionModel, setPredictionModel] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const onSelectAthlete = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // ! can make lib to automatically add content header?
        fetch("/api/getAthleteData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                athleteUrl: athleteUrl,
                year: year
            })
        }).then(res => {
            return res.json();
        }).then(data => {
            if(data.err) {
                alert(data.err);
            }
            setAthleteData(data);
            setIsLoading(false);
        }).catch((err) => {
            console.error(err);
            setIsLoading(false);
        });
    }

    const onSelectCourse = (e) => {
        e.preventDefault();
        setIsLoading(true);

        console.log("Selected course: " + meetUrl);
        fetch("/api/getMeetData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meetUrl: meetUrl
            })
        }).then(res => res.json()).then(data => {
            setMeetData(data);

            // Filter out results where avg time could not be obtained
            const trainingData = data.meetResults.filter((result) => result.avgTime !== null).map((result, index) => [parseFloat(result.avgTime), parseFloat(result.SortValue)]);
            const model = regression.linear(trainingData);
            setPredictionModel(model);

            setIsLoading(false);
        }).catch((err) => {
            console.error(err);
            setIsLoading(false);
        });
    }

    const getMeetAnalytics = () => {

        let srs = 0;
        let avgDropTotal = 0;
        let avgDropCounter = 0;

        if(meetData) {
            meetData.meetResults.forEach((result, index) => {
                if(result.sr) srs += 1;

                if(result.avgTime != null) {
                    avgDropTotal += (result.SortValue - result.avgTime);
                    avgDropCounter += 1;
                }
            });
        }

        const avgDrop = avgDropTotal / avgDropCounter;

        return {srs: srs, avgDrop: avgDrop};
    }

    // ! TODO Check if meet and athlete links are in right form with regular expression!

    return (
        <Box py="15vh">
            <Heading>Predict an Athlete</Heading>
            <Stack my={8} mx={8}>
                <Heading>Athlete Selection Form</Heading>
                <Box>
                    <Box>
                        <Text>Athlete</Text>
                        <Input placeholder="Paste the athlete's athletic.net url" type="text" value={athleteUrl} onChange={(e) => setAthleteUrl(e.target.value)}/>
                    </Box>
                    <Box>
                        <Text>Year</Text>
                        <Select placeholder="Select year" value={year} onChange={(e) => setYear(e.target.value)}>
                            {
                                ["2018", "2019", "2020", "2021"].map((val, index) => (
                                    <option key={index} value={val}>{val}</option>
                                ))
                            }
                        </Select>
                    </Box>
                    <Button onClick={onSelectAthlete} disabled={isLoading}>Select</Button>
                </Box>
                {/** // ! Better organization for this and a loading component please */}
                {(!athleteData && isLoading) && (
                    <Heading>Loading...</Heading>
                )}
                {(athleteData && athleteData.err) && (
                    <Box>
                        <Text>{athleteData.err}</Text>
                    </Box>
                )}
                {(athleteData && !athleteData.err) && (
                    <Box>
                        <Heading>Selected Athlete</Heading>
                        <Text>{`Name: ${athleteData.athleteName}`}</Text>
                        <Text>{`ID: ${athleteData.athleteId}`}</Text>
                        <Text>{`${athleteData.gradeYear}th Grade in ${athleteData.year}`}</Text>
                        <hr />
                        <Text>{`Average Time for the ${athleteData.year} season: ${athleteData.averageTime} ${secondsToString(athleteData.averageTime)}`}</Text>
                        <Text>{`SR for the ${athleteData.year} season: ${athleteData.seasonRecord} ${stringToSeconds(athleteData.seasonRecord)}`}</Text>
                        <Text>{`All Time PR: ${athleteData.personalRecord} ${stringToSeconds(athleteData.personalRecord)}`}</Text>
                    </Box>
                )}
                <Heading>Courses!</Heading>
                <Box>
                    <Box>
                        <Box>
                            <Text>Course</Text>
                            <Input placeholder="Paste the meet's athletic.net url" type="text" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} />
                        </Box>
                        <Button onClick={onSelectCourse} disabled={isLoading}>Select</Button>
                    </Box>
                </Box>
                {(!meetData && isLoading) && (
                    <Heading>Loading meet data...</Heading>
                )}
                {(meetData && predictionModel) && (
                    <Box>
                        <Heading>Selected Meet</Heading>
                        <Text>Meet Name will go here</Text>
                        <Text>{`Meet ID: ${meetData.meetId} Div ID: ${meetData.divId}`}</Text>
                        <hr />
                        <Text>{`Out of all ${meetData.numAthletes} athlete, there were ${getMeetAnalytics().srs} SRS, for a rate of ${(getMeetAnalytics().srs / meetData.numAthletes) * 100}%`}</Text>
                        <Text>{`Athletes ran ${getMeetAnalytics().avgDrop > 0 ? getMeetAnalytics.avgDrop + "slower" : getMeetAnalytics().avgDrop * -1 + "faster"} than their average time that season`}</Text>
                        <Heading>Results!</Heading>
                        <Accordion allowToggle>
                            <AccordionItem>
                                <Heading>
                                    <AccordionButton bg="gray.100">
                                        <Box flex="1" textAlign="left">Results Page</Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </Heading>
                                <AccordionPanel padding={4} maxHeight="200px" overflowY="scroll">
                                    {
                                        meetData.meetResults.map((result, index) => (
                                            <Text key={index}>{`${result.Place}. ${result.FirstName} ${result.LastName} ${result.Result} (${result.SortValue}) (Avg: ${result.avgTime})`}</Text>
                                        ))
                                    }
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                        <Heading>Athlete Prediction!</Heading>
                        <Text>{`Prediction Line: ${predictionModel.string}`}</Text>
                        <Text>{`Given ${athleteData.athleteName}'s avg time of ${athleteData.averageTime} seconds for the ${athleteData.year} season`}</Text>
                        <Text>{`Based on how other athletes in the race ran compared to their average time, ${athleteData.athleteName} would run a ${secondsToString(predictionModel.predict(athleteData.averageTime)[1])} at Meet Name`}</Text>
                    </Box>
                    )}
            </Stack>
        </Box>
    );
};

export default Predict;