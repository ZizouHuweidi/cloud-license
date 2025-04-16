import React, { useState } from 'react';
import { Box, VStack, Heading, Badge } from '@chakra-ui/react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/tabs';
import { useColorMode } from '@chakra-ui/color-mode';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { License } from '../../types';
import { useDeviceLicenses, useLicenseDevices } from '../../hooks/useLicenses';

export const LicenseSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'device' | 'license'>('device');
  
  const { data: deviceLicenses, isLoading: isLoadingDeviceLicenses } = useDeviceLicenses(
    searchType === 'device' ? searchTerm : ''
  );
  
  const { data: licenseDevices, isLoading: isLoadingLicenseDevices } = useLicenseDevices(
    searchType === 'license' ? searchTerm : ''
  );

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'white' : 'gray.700';

  return (
    <Box bg={bgColor} p={5} rounded="lg" shadow="sm">
      <VStack gap={4} alignItems="stretch" direction="column">
        <Heading size="md">License Search</Heading>
        <Tabs onChange={(index) => setSearchType(index === 0 ? 'device' : 'license')}>
          <TabList>
            <Tab>Search by Device</Tab>
            <Tab>Search by License</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Enter device service tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              {searchTerm && !isLoadingDeviceLicenses && deviceLicenses && (
                <Table variant="simple" mt={4}>
                  <Thead>
                    <Tr>
                      <Th>License Type</Th>
                      <Th>Key</Th>
                      <Th>Expiry Date</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {deviceLicenses.data.map((license: License) => (
                      <Tr key={license.id}>
                        <Td>{license.type}</Td>
                        <Td>{license.key}</Td>
                        <Td>{format(new Date(license.expiry_date), 'PP')}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              new Date(license.expiry_date) > new Date()
                                ? 'green'
                                : 'red'
                            }
                          >
                            {new Date(license.expiry_date) > new Date()
                              ? 'Active'
                              : 'Expired'}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>
            <TabPanel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Enter license type or key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              {searchTerm && !isLoadingLicenseDevices && licenseDevices && (
                <Table variant="simple" mt={4}>
                  <Thead>
                    <Tr>
                      <Th>Device ID</Th>
                      <Th>Service Tag</Th>
                      <Th>Model</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {licenseDevices.data.map((device) => (
                      <Tr key={device.id}>
                        <Td>{device.id}</Td>
                        <Td>{device.service_tag}</Td>
                        <Td>{device.model}</Td>
                        <Td>
                          <Badge colorScheme={device.status === 'active' ? 'green' : 'red'}>
                            {device.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default LicenseSearch;
