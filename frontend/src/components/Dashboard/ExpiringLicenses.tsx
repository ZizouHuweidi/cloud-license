import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { useExpiringLicenses } from '../../hooks/useLicenses';
import { format } from 'date-fns';

export const ExpiringLicenses: React.FC = () => {
  const { data: expiringLicensesResponse } = useExpiringLicenses();

  const getBadgeColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) return 'red';
    if (daysUntilExpiry <= 30) return 'yellow';
    return 'green';
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Licenses Expiring Soon</Heading>
      <VStack gap={4} align="stretch">
        {expiringLicensesResponse?.data.map((license) => (
          <Box
            key={license.id}
            p={4}
            bg="white"
            shadow="sm"
            borderWidth="1px"
            borderRadius="lg"
          >
            <Text fontWeight="bold">{license.device.name}</Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Expires: {format(new Date(license.expiry_date), 'PP')}
            </Text>
            <Badge
              mt={2}
              colorScheme={getBadgeColor(license.days_until_expiry)}
            >
              Expires in {license.days_until_expiry} days
            </Badge>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ExpiringLicenses;
