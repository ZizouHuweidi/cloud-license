import React from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  Heading,
  Button,
  Flex,
  HStack,
  useColorMode,
} from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useEntityAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLog } from '../../types';

interface LicenseHistoryProps {
  licenseId: string;
}

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'green';
    case 'update':
      return 'blue';
    case 'delete':
      return 'red';
    default:
      return 'gray';
  }
};

const formatChanges = (changes: Record<string, any>) => {
  if (changes.initial_state) {
    return {
      type: 'creation',
      data: changes.initial_state,
    };
  }

  if (changes.previous_state && changes.updated_fields) {
    return {
      type: 'update',
      previous: changes.previous_state,
      updated: changes.updated_fields,
    };
  }

  return {
    type: 'other',
    data: changes,
  };
};

const ChangeDetails: React.FC<{ changes: Record<string, any> }> = ({ changes }) => {
  const formattedChanges = formatChanges(changes);

  switch (formattedChanges.type) {
    case 'creation':
      return (
        <Box>
          <Text fontWeight="bold" mb={2}>Initial License Details:</Text>
          {Object.entries(formattedChanges.data).map(([key, value]) => (
            <Text key={key}>
              <Text as="span" fontWeight="medium">{key}:</Text> {String(value)}
            </Text>
          ))}
        </Box>
      );
    case 'update':
      return (
        <Box>
          <Text fontWeight="bold" mb={2}>Updated Fields:</Text>
          {Object.entries(formattedChanges.updated).map(([key, value]) => (
            <Box key={key} mb={2}>
              <Text fontWeight="medium">{key}:</Text>
              <Text color="red.500">- {String(formattedChanges.previous[key])}</Text>
              <Text color="green.500">+ {String(value)}</Text>
            </Box>
          ))}
        </Box>
      );
    default:
      return <Text>No detailed changes available</Text>;
  }
};

export const LicenseHistory: React.FC<LicenseHistoryProps> = ({ licenseId }) => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);
  const { data: auditLogsResponse, isLoading } = useEntityAuditLogs('license', licenseId, page, limit);
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'white' : 'gray.700';

  const totalPages = auditLogsResponse?.data
    ? Math.ceil(auditLogsResponse.data.count / limit)
    : 0;

  if (isLoading) {
    return <Text>Loading history...</Text>;
  }

  return (
    <Box>
      <Heading size="md" mb={4}>License History</Heading>
      <VStack spacing={4} align="stretch">
        <Accordion allowMultiple>
          {auditLogsResponse?.data.data.map((log: AuditLog) => (
            <AccordionItem key={log.id} border="none" mb={2} value={log.id}>
              <AccordionButton
                bg={bgColor}
                p={4}
                borderRadius="md"
                _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.600' }}
              >
                <Box flex="1" textAlign="left">
                  <Badge colorScheme={getActionColor(log.action)} mb={2}>
                    {log.action.toUpperCase()}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {format(new Date(log.timestamp), 'PPpp')}
                  </Text>
                  {log.user && (
                    <Text fontSize="sm" color="gray.500">
                      by {log.user.email}
                    </Text>
                  )}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ChangeDetails changes={log.changes} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        {(!auditLogsResponse?.data.data.length) && (
          <Text textAlign="center" color="gray.500">No history available</Text>
        )}
        {auditLogsResponse?.data.data.length > 0 && (
          <Flex justify="center" mt={4}>
            <HStack spacing={2}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                size="sm"
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                size="sm"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default LicenseHistory;
