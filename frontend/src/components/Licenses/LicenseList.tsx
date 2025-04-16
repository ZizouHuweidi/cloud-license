import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useColorModeValue,
  Flex,
  Heading,
  IconButton,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useLicenses, useDeleteLicense } from '../../hooks/useLicenses';
import { License } from '../../types';
import LicenseForm from './LicenseForm';
import { format } from 'date-fns';

export default function LicenseList() {
  const { data: licensesResponse } = useLicenses();
  const deleteLicense = useDeleteLicense();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLicense, setSelectedLicense] = React.useState<License | null>(null);

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      await deleteLicense.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    setSelectedLicense(null);
    onOpen();
  };

  const getLicenseStatusColor = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'red';
    if (daysUntilExpiry <= 30) return 'yellow';
    return 'green';
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Licenses</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAdd}>
          Add License
        </Button>
      </Flex>

      <Box
        bg={useColorModeValue('white', 'gray.800')}
        shadow="sm"
        rounded="lg"
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Device</Th>
              <Th>Type</Th>
              <Th>Key</Th>
              <Th>Expiry Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {licensesResponse?.data.data.map((license) => (
              <Tr key={license.id}>
                <Td>{license.device.name}</Td>
                <Td>{license.type}</Td>
                <Td>{license.key}</Td>
                <Td>{format(new Date(license.expiry_date), 'PP')}</Td>
                <Td>
                  <Badge
                    colorScheme={getLicenseStatusColor(license.expiry_date)}
                    variant="subtle"
                    px={2}
                    py={1}
                    rounded="full"
                  >
                    {new Date(license.expiry_date) > new Date() ? 'Active' : 'Expired'}
                  </Badge>
                </Td>
                <Td>
                  <IconButton
                    aria-label="Edit license"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEdit(license)}
                  />
                  <IconButton
                    aria-label="Delete license"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(license.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <LicenseForm
        isOpen={isOpen}
        onClose={onClose}
        license={selectedLicense}
      />
    </Box>
  );
}
