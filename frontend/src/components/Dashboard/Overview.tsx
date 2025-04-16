import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Container,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/color-mode';
import DashboardStats from './DashboardStats';
import ExpiringLicenses from './ExpiringLicenses';

export const Overview: React.FC = () => {
  return (
    <Container maxW="container.xl" py={5}>
      <Heading mb={6}>License Management Dashboard</Heading>
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <Box>
          <DashboardStats />
        </Box>
        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={5}
          rounded="lg"
          shadow="sm"
        >
          <ExpiringLicenses />
        </Box>
      </Grid>
    </Container>
  );
};

export default Overview;
