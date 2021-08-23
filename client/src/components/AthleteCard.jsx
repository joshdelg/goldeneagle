import { Heading, Text, Box, Badge, Flex, Tooltip } from "@chakra-ui/react";
import { secondsToString, stringToSeconds } from "../lib/timeLibs";
import React from "react";

function AthleteCard(props) {

    return (
        (props.athleteData ?
        (<Box background="gray" m={2} p={2}>
            <Badge fontSize="l" borderRadius="full" px={2} colorScheme="teal">{props.athleteData.year}</Badge>
                <Text fontSize="3xl">
                    <Tooltip label={`AID: ${props.athleteData.athleteId}`}>{props.athleteData.athleteName}</Tooltip>
                    &nbsp;&bull;&nbsp;{props.athleteData.gradeYear}th Grade in {props.athleteData.year}
                </Text>
            <Text>
                Average Season Time: <Tooltip label={props.athleteData.averageTime + " seconds"}>{secondsToString(props.athleteData.averageTime)}</Tooltip>
            </Text>
            <Text>
                Season Record: <Tooltip label={stringToSeconds(props.athleteData.seasonRecord) + " seconds"}>{props.athleteData.seasonRecord}</Tooltip>
            </Text>
            <Text>
                Personal Record: <Tooltip label={stringToSeconds(props.athleteData.personalRecord) + " seconds"}>{props.athleteData.personalRecord}</Tooltip>
            </Text>
        </Box>) : <></>)
    );
}

export default AthleteCard;