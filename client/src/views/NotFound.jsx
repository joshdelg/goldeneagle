import { Flex, Heading } from "@chakra-ui/layout";
import React from "react";

function NotFound() {
    return (
        <Flex textAlign="center" flexDirection="column" justifyContent="center">
            <Heading>Sorry, we couldn't find that page</Heading>
        </Flex>
    );
}

export default NotFound;