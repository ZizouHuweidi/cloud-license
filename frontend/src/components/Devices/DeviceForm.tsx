import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useCreateDevice, useUpdateDevice } from '../../hooks/useDevices';
import { Device } from '../../types';

interface DeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  device?: Device | null;
}

export default function DeviceForm({ isOpen, onClose, device }: DeviceFormProps) {
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice(device?.id || '');
  const [formData, setFormData] = React.useState({
    name: '',
    serial_number: '',
    status: 'active',
  });

  React.useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        serial_number: device.serial_number,
        status: device.status,
      });
    } else {
      setFormData({
        name: '',
        serial_number: '',
        status: 'active',
      });
    }
  }, [device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (device) {
        await updateDevice.mutateAsync(formData);
      } else {
        await createDevice.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{device ? 'Edit Device' : 'Add Device'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter device name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Serial Number</FormLabel>
                <Input
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={createDevice.isLoading || updateDevice.isLoading}
            >
              {device ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
