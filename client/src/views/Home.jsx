import React from "react";
import { Heading, Box } from "@chakra-ui/react";

function Home(props) {
    return (
        <Box bgGradient="linear-gradient(135deg, rgba(255,191,80,1) 0%, rgba(238,230,53,1) 100%);" minHeight="100vh" textAlign="center">
            <Box display="flex" height="100vh" flexDirection="column" justifyContent="center">
                <Heading>This is the home page!</Heading>
            </Box>
        </Box>
    );
}

export default Home;