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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useDevices, useDeleteDevice } from '../../hooks/useDevices';
import { Device } from '../../types';
import DeviceForm from './DeviceForm';

export default function DeviceList() {
  const { data: devicesResponse } = useDevices();
  const deleteDevice = useDeleteDevice();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      await deleteDevice.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    setSelectedDevice(null);
    onOpen();
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Devices</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAdd}>
          Add Device
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
              <Th>Name</Th>
              <Th>Serial Number</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {devicesResponse?.data.data.map((device) => (
              <Tr key={device.id}>
                <Td>{device.name}</Td>
                <Td>{device.serial_number}</Td>
                <Td>{device.status}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit device"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEdit(device)}
                  />
                  <IconButton
                    aria-label="Delete device"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(device.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <DeviceForm
        isOpen={isOpen}
        onClose={onClose}
        device={selectedDevice}
      />
    </Box>
  );
}
