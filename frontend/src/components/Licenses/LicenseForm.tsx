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
import { useCreateLicense, useUpdateLicense } from '../../hooks/useLicenses';
import { useDevices } from '../../hooks/useDevices';
import { License } from '../../types';

interface LicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  license?: License | null;
}

export default function LicenseForm({ isOpen, onClose, license }: LicenseFormProps) {
  const createLicense = useCreateLicense();
  const updateLicense = useUpdateLicense(license?.id || '');
  const { data: devicesResponse } = useDevices();
  const [formData, setFormData] = React.useState({
    device_id: '',
    type: '',
    key: '',
    expiry_date: '',
  });

  React.useEffect(() => {
    if (license) {
      setFormData({
        device_id: license.device.id,
        type: license.type,
        key: license.key,
        expiry_date: new Date(license.expiry_date).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        device_id: '',
        type: '',
        key: '',
        expiry_date: '',
      });
    }
  }, [license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (license) {
        await updateLicense.mutateAsync(formData);
      } else {
        await createLicense.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving license:', error);
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
          <ModalHeader>{license ? 'Edit License' : 'Add License'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Device</FormLabel>
                <Select
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleChange}
                  placeholder="Select device"
                >
                  {devicesResponse?.data.data.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.serial_number})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>License Type</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Select license type"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>License Key</FormLabel>
                <Input
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="Enter license key"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Expiry Date</FormLabel>
                <Input
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                />
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
              isLoading={createLicense.isLoading || updateLicense.isLoading}
            >
              {license ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
