import { Box, Heading, Stack, Button, Input, Select, Text } from "@chakra-ui/react";
import React, { useState } from "react";

function Predict(props) {

    /*const [athleteData, setAthleteData] = useState({}); // !in addition, SR, avg time that season/thus far, team ranking?, all time PR?
    const [courseData, setCourseData] = useState({}); // !in addition, avg time drop/team time drop/num PRs after computation though in new dataset*/

    const [athleteUrl, setAthleteUrl] = useState("");
    const [meetUrl, setMeetUrl] = useState("");
    const [year, setYear] = useState("");

    const onSelectAthlete = (e) => {
        e.preventDefault();

        // ! can make lib to automatically add content header?
        fetch("/api/getAthleteData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                athleteUrl: athleteUrl
            })
        }).then(res => res.json()).then(data => console.log(data)).catch((err) => console.error(err));
    }

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
                    <Button onClick={onSelectAthlete}>Select</Button>
                </Box>
                <Box>
                    <Heading>Courses!</Heading>
                    <Box>
                        <Box>
                            <Text>Course</Text>
                            <Input placeholder="Paste the meet's athletic.net url" type="text" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} />
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default Predict;