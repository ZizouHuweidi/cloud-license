import { Outlet } from '@tanstack/react-router';
import { Box } from '@chakra-ui/react';
import React from 'react';

export const DashboardLayout = () => {
  return (
    <Box p={4}>
      <Outlet />
    </Box>
  );
};

export default DashboardLayout;
