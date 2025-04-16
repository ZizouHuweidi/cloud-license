import React from 'react';
import {
  SimpleGrid,
  Box,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/color-mode';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/stat';
import { useDeviceStats } from '../../hooks/useDevices';
import { useLicenseStats } from '../../hooks/useLicenses';

export const DashboardStats: React.FC = () => {
  const { data: deviceStats } = useDeviceStats();
  const { data: licenseStats } = useLicenseStats();

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
      <StatBox
        label="Total Devices"
        value={deviceStats?.data.total_devices || 0}
        helpText="Total registered devices"
      />
      <StatBox
        label="Active Licenses"
        value={licenseStats?.data.active_licenses || 0}
        helpText="Currently valid licenses"
      />
      <StatBox
        label="Expiring Soon"
        value={licenseStats?.data.expiring_soon || 0}
        helpText="Licenses expiring in 30 days"
      />
    </SimpleGrid>
  );
};

interface StatBoxProps {
  label: string;
  value: number;
  helpText: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, helpText }) => {
  return (
    <Box
      p={5}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="lg"
      shadow="sm"
    >
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
        <StatHelpText>{helpText}</StatHelpText>
      </Stat>
    </Box>
  );
};

export default DashboardStats;
