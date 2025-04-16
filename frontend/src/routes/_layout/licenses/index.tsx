import React from 'react';
import {
  Box,
  Button,
  Container,
  HStack,
  Badge,
  IconButton,
  Text,
  Flex,
  VStack,
  Input,
  Stack,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiDownload, FiEdit2, FiEye, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useLicenses } from '../../../hooks/useLicenses';
import { License } from '../../../types';


function LicensesPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [filters, setFilters] = React.useState({
    search: '',
    type: '',
    status: '',
  });
  
  const { data: licensesResponse, isLoading } = useLicenses(page);
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'white' : 'gray.700';

  const totalPages = licensesResponse?.data
    ? Math.ceil(licensesResponse.data.count / limit)
    : 0;

  return (
    <Container maxW="full" py={6}>
      <Box bg={bgColor} borderRadius="lg" shadow="sm" overflow="hidden">
        <Box p={6}>
          <Stack direction="column" gap={4} mb={6}>
            <Stack direction="row" justify="space-between">
              <Text fontSize="2xl" fontWeight="bold">
                Licenses
              </Text>
              <Link to="/licenses/new">
                <Button colorScheme="blue">New License</Button>
              </Link>
            </Stack>

            <Stack direction="row" gap={4} alignItems="center">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Search licenses..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </InputGroup>

              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                placeholder="All Types"
                w="200px"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </Select>

              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                placeholder="All Statuses"
                w="200px"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </Select>

              <Button
                onClick={() => window.open(`/api/licenses/export?${new URLSearchParams(filters).toString()}`, '_blank')}
                _icon={<FiDownload />}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Key</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Expiration</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {licensesResponse?.data.data.map((license: License) => (
                <Tr key={license.id}>
                  <Td>{license.key}</Td>
                  <Td>{license.type}</Td>
                  <Td>
                    <Badge colorScheme={new Date(license.expiry_date) > new Date() ? 'green' : 'red'}>
                      {new Date(license.expiry_date) > new Date() ? 'Active' : 'Expired'}
                    </Badge>
                  </Td>
                  <Td>
                    {license.expiry_date
                      ? format(new Date(license.expiry_date), 'PP')
                      : 'No expiration'}
                  </Td>
                  <Td>{format(new Date(license.created_at), 'PP')}</Td>
                  <Td>
                    <HStack gap={2}>
                      <Link to={`/licenses/${license.id}`}>
                        <IconButton
                          aria-label="View"
                          _icon={<FiEye />}
                          size="sm"
                        />
                      </Link>
                      <Link to={`/licenses/${license.id}/edit`}>
                        <IconButton
                          aria-label="Edit"
                          _icon={<FiEdit2 />}
                          size="sm"
                        />
                      </Link>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justify="space-between" align="center" mt={4}>
            <HStack>
              <Text>Show</Text>
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                w="auto"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
              <Text>entries</Text>
            </HStack>

            <HStack>
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
        </Box>
      </Box>
    </Container>
  );
}

export default createFileRoute('/_layout/licenses/')({
  component: LicensesPage,
});
