import { Box, Heading, Stack } from "@chakra-ui/layout";
import { FormControl, Input, Select, Text } from "@chakra-ui/react";
import React, { useState } from "react";

function Predict(props) {

    const [year, setYear] = useState("");

    return (
        <Box py="15vh">
            <Heading>Predict an Athlete</Heading>
            <Stack my={8} mx={8}>
                <Heading>Athlete Selection Form</Heading>
                <Box>
                    <Box>
                        <Text>Athlete</Text>
                        <Input placeholder="Paste the athlete's athletic.net url" type="text" />
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
                </Box>
            </Stack>
        </Box>
    );
};

export default Predict;