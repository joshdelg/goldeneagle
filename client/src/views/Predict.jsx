import { Box, Heading, Stack, Button, Input, Select, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Grid, GridItem, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { secondsToString, stringToSeconds } from "../lib/timeLibs";
import regression from 'regression';
import AthleteCard from "../components/AthleteCard";
import RaceCard from "../components/RaceCard";

function Predict(props) {

    const athleteUrlPrefix = 'https://www.athletic.net/CrossCountry/Athlete.aspx?AID=';

    const [athleteSelectMode, setAthleteSelectMode] = useState('School');

    const [athleteData, setAthleteData] = useState(); // !in addition, SR, avg time that season/thus far, team ranking?, all time PR?
    const [meetData, setMeetData] = useState(); // !in addition, avg time drop/team time drop/num PRs after computation though in new dataset

    const [athleteId, setAthleteId] = useState();

    const [athleteUrl, setAthleteUrl] = useState("");
    const [meetUrl, setMeetUrl] = useState("");
    const [year, setYear] = useState("");

    const[predictionModel, setPredictionModel] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const [schoolUrl, setSchoolUrl] = useState("");
    const [schoolAthletes, setSchoolAthletes] = useState();

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

    const onSubmitSchool = (e) => {
        e.preventDefault();

        // Request to get athelte list
        setIsLoading(true);
        fetch('/api/getSchoolAthletes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                schoolId: schoolUrl.split("SchoolID=")[1],
                year: year
            })
        }).then(res => res.json()).then(data => {
            setSchoolAthletes(data.athleteList);
            setAthleteId(data.athleteList[0].athleteId)
        });
        setIsLoading(false);
    }

    const selectSchoolAthlete = (e) => {
        e.preventDefault();

        setAthleteUrl(athleteUrlPrefix + athleteId);
        setIsLoading(true);

        // ! can make lib to automatically add content header?
        fetch("/api/getAthleteData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                athleteUrl: athleteUrlPrefix + athleteId,
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

    // ! TODO Check if meet and athlete links are in right form with regular expression!

    return (
        <Box py="15vh">
            <Heading>Predict an Athlete</Heading>
            <Box m={4}>
                <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" rowGap={2} gap={8}>
                    <Box p={2}>
                        <Heading>Select an athlete</Heading>
                        <Box>
                            <Box my={4}>
                                <Text my={2}>Find athlete by</Text>
                                <Select value={athleteSelectMode} onChange={(e) => setAthleteSelectMode(e.target.value)}>
                                    <option value={"School"}>School</option>
                                    <option value={"URL"}>URL</option>
                                </Select>
                            </Box>
                            <Box my={4}>
                                <Text my={2}>Choose a year</Text>
                                <Select placeholder="Select year" value={year} onChange={(e) => setYear(e.target.value)}>
                                    {
                                        ["2018", "2019", "2020", "2021"].map((val, index) => (
                                            <option key={index} value={val}>{val}</option>
                                        ))
                                    }
                                </Select>
                            </Box>
                            {(athleteSelectMode === "School") ? (
                                <>
                                    <Box my={4}>
                                        <Text my={2}>Paste school url</Text>
                                        <Flex>
                                            <Input type="text" value={schoolUrl} onChange={(e) => setSchoolUrl(e.target.value)} placeholder="https://www.athletic.net/CrossCountry/School.aspx?SchoolID=408" />
                                            <Button mx={2} onClick={onSubmitSchool} disabled={isLoading || !schoolUrl}>Select School</Button>
                                        </Flex>
                                    </Box>
                                    <Box my={4}>
                                        <Text my={2}>
                                            Select an athlete
                                        </Text>
                                        <Flex>
                                            <Select placeholder="Select a school first" value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
                                                {
                                                    schoolAthletes && schoolAthletes.map((ath, index) => (<option key={index} value={ath.athleteId}>{ath.name}</option>))
                                                }
                                            </Select>
                                            <Button mx={2} onClick={selectSchoolAthlete} disabled={isLoading || !schoolAthletes || schoolAthletes.err}>Select Athlete</Button>
                                        </Flex>
                                    </Box>
                                </>
                            ) : (
                                <Box my={4}>
                                    <Text my={2}>Paste athlete url</Text>
                                    <Input type="text" placeholder="https://www.athletic.net/CrossCountry/Athlete.aspx?AID=13955486" />
                                </Box>
                            )}
                        </Box>

                    </Box>
                    <Box p={2}>
                        <Heading>Select a race</Heading>
                        <Box>
                            <Box my={4}>
                                <Text my={2}>Paste race url</Text>
                                <Flex>
                                    <Input type="text" placeholder="https://www.athletic.net/CrossCountry/meet/190207/results/769452" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)}/>
                                    <Button mx={2} onClick={onSelectCourse} disabled={isLoading}>Select Race</Button>
                                </Flex>
                            </Box>
                        </Box>
                        {
                            (meetData && meetData.meetResults) && (
                                <Box height="60%">
                                    <Accordion allowToggle defaultIndex={0}>
                                        <AccordionItem>
                                            <Heading>
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left">Results</Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </Heading>
                                            <AccordionPanel padding={4} height="210px" overflowY="scroll">
                                                {
                                                    meetData.meetResults.map((result, index) => (
                                                        <Text key={index}>{`${result.Place}. ${result.FirstName} ${result.LastName} ${result.Result} (${result.SortValue}) (Avg: ${result.avgTime})`}</Text>
                                                    ))
                                                }
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </Box>
                            )
                        }
                    </Box>
                    <Box p={2}>
                    {
                        athleteData && (
                            athleteData.err ? (
                                <Heading>{athleteData.err}</Heading>
                            ) : (
                                <>
                                    <Heading>Selected athlete</Heading>
                                    <AthleteCard athleteData={athleteData} />
                                </>
                            )
                        )
                    }
                    </Box>
                    <Box p={2}>
                    {
                        meetData && (
                            meetData.err ? (
                                <Heading>Meet err</Heading>
                            ) : (
                                <>
                                    <Heading>Selected race</Heading>
                                    <RaceCard meetData={meetData} />
                                </>
                            )
                        )
                    }
                    </Box>
                </Grid>
            </Box>
            {/*<Stack my={8} mx={8}>
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
                <Heading>Select athlete by school</Heading>
                <Box>
                    <Box>
                        <Text>School</Text>
                        <Input placeholder="Paste school athletic.net url" type="text" value={schoolUrl} onChange={(e) => setSchoolUrl(e.target.value)} />
                        <Button onClick={onSubmitSchool}>Select</Button>
                    </Box>
                    {
                        (schoolAthletes && !schoolAthletes.err) && (
                            <Box>
                                <Text>
                                    Select Athlete
                                </Text>
                                <Select placeholder="Select athlete" value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
                                {
                                    schoolAthletes.map((ath, index) => (<option key={index} value={ath.athleteId}>{ath.name}</option>))
                                }
                                </Select>
                                <Button onClick={selectSchoolAthlete}>Select Athlete</Button>
                            </Box>
                        )
                    }
                </Box>
                { // ! Better organization for this and a loading component please }
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
                                </Stack>*/}
        </Box>
    );
};

export default Predict;