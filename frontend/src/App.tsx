// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';

// Pages
import HomePage from './pages/HomePage';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import VenueScanner from './pages/VenueScanner';

// Components
import Navbar from './components/Navbar';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:address" element={<EventDetail />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/scanner/:eventAddress" element={<VenueScanner />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;