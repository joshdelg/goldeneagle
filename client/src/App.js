import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Heading, Stack } from '@chakra-ui/react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './views/Home';
import Predict from './views/Predict';
import Navbar from './components/Navbar';
import NotFound from './views/NotFound';

function App() {

  return (
    <ChakraProvider>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/predict">
            <Predict />
          </Route>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
}

export default App;
