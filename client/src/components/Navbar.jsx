import React from "react";
import { Heading, Box, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

function Navbar(props) {

    let location = useLocation();

    return (
        <Box position="absolute" width="100%" height="10vh" paddingX="10vw" bgGradient={location.pathname !== "/" && "linear-gradient(135deg, rgba(255,191,80,1) 0%, rgba(238,230,53,1) 100%);"}>
            <Flex direction="row" justify="space-between" alignItems="center" height="100%">
                <Heading>Golden Eagle</Heading>
                <Flex fontSize="xl">
                    <Box mr={8}>
                        <RouterLink to="/">Home</RouterLink>
                    </Box>
                    <Box mr={8}>
                        <RouterLink to="/predict">Predict</RouterLink>
                    </Box>
                    <Box mr={8}>
                        <RouterLink to="/dashboard">Dashboard</RouterLink>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
}

export default Navbar;