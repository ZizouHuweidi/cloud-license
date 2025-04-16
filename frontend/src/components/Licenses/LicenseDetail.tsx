import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Heading,
  Divider,
  Skeleton,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useLicense } from '../../hooks/useLicenses';
import { LicenseHistory } from '../AuditLogs/LicenseHistory';

export const LicenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: licenseResponse, isLoading } = useLicense(id || '');
  const bgColor = useColorModeValue('white', 'gray.700');

  if (!id) {
    return <Text>License ID not found</Text>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">License Details</Heading>
        <Button onClick={() => navigate('/licenses')}>Back to Licenses</Button>
      </HStack>
      
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        {isLoading ? (
          <VStack spacing={4} align="stretch">
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </VStack>
        ) : licenseResponse?.data ? (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">License Key:</Text>
              <Text>{licenseResponse.data.key}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Status:</Text>
              <Badge colorScheme={licenseResponse.data.active ? 'green' : 'red'}>
                {licenseResponse.data.active ? 'Active' : 'Inactive'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Type:</Text>
              <Text>{licenseResponse.data.type}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Expiration Date:</Text>
              <Text>
                {licenseResponse.data.expiration_date
                  ? format(new Date(licenseResponse.data.expiration_date), 'PPP')
                  : 'No expiration'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Created At:</Text>
              <Text>{format(new Date(licenseResponse.data.created_at), 'PPP')}</Text>
            </HStack>
            {licenseResponse.data.notes && (
              <Box>
                <Text fontWeight="bold">Notes:</Text>
                <Text mt={2}>{licenseResponse.data.notes}</Text>
              </Box>
            )}
          </VStack>
        ) : (
          <Text>License not found</Text>
        )}
      </Box>

      <Divider />

      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        <LicenseHistory licenseId={id} />
      </Box>
    </VStack>
  );
};

export default LicenseDetail;
