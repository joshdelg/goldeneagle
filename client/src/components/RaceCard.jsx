import { Heading, Text, Box, Badge, Flex, Tooltip } from "@chakra-ui/react";
import { secondsToString, stringToSeconds } from "../lib/timeLibs";
import React from "react";

function RaceCard(props) {

    let srs = 0;
    let avgDropCounter = 0;
    let avgDropTotal = 0;

    props.meetData.meetResults.forEach((result, index) => {
        if(result.sr) srs += 1;

        if(result.avgTime != null) {
            avgDropTotal += (result.SortValue - result.avgTime);
            avgDropCounter += 1;
        }
    });

    const avgDrop = Math.round(avgDropTotal / avgDropCounter);

    return (
        (props.meetData ?
        (<Box m={2} p={2} boxShadow="md" rounded="md">
            <Badge fontSize="l" borderRadius="full" px={2} colorScheme="teal">{props.meetData.year}</Badge>
            <Text fontSize="3xl">{props.meetData.meetName}</Text>
            <Text fontSize="xl">{props.meetData.divName}</Text>
            <Text>Srs {srs}</Text>
            <Text>Sr Percent {(srs/props.meetData.numAthletes).toFixed(2) * 100}%</Text>
            <Text>The average runner ran {Math.abs(avgDrop)} seconds {(avgDrop < 0) ? 'faster' : 'slower'} than their average time that season</Text>
        </Box>) : <></>)
    );
}

export default RaceCard;