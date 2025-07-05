// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import theme from './theme';

// Pages
import HomePage from './pages/HomePage';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import VenueScanner from './pages/VenueScanner';

// Components
import Navbar from './components/Navbar';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 3,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
                <Route path="/scanner" element={<VenueScanner />} />
              </Routes>
            </Box>
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;