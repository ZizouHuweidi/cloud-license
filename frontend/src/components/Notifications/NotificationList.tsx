import React from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  IconButton,
  HStack,
  Spacer,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { useNotifications, useUpdateNotification, useDeleteNotification } from '../../hooks/useNotifications';

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

export const NotificationList: React.FC = () => {
  const { data: notificationsResponse, isLoading } = useNotifications();
  const updateNotification = useUpdateNotification('');
  const deleteNotification = useDeleteNotification();
  const toast = useToast();

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateNotification.mutateAsync({ read: true });
      toast({
        title: 'Notification marked as read',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error marking notification as read',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast({
        title: 'Notification deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting notification',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <Text>Loading notifications...</Text>;
  }

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {notificationsResponse?.data.data.map((notification) => (
        <Box
          key={notification.id}
          p={4}
          bg={notification.read ? 'gray.50' : 'white'}
          borderWidth="1px"
          borderRadius="lg"
          shadow="sm"
        >
          <HStack spacing={4}>
            <Badge colorScheme={getUrgencyColor(notification.urgency)}>
              {notification.urgency.toUpperCase()}
            </Badge>
            <Text flex="1">{notification.message}</Text>
            <Text fontSize="sm" color="gray.500">
              {format(new Date(notification.notification_date), 'PP')}
            </Text>
            {!notification.read && (
              <IconButton
                aria-label="Mark as read"
                icon={<CheckIcon />}
                size="sm"
                colorScheme="green"
                onClick={() => handleMarkAsRead(notification.id)}
              />
            )}
            <IconButton
              aria-label="Delete notification"
              icon={<CloseIcon />}
              size="sm"
              colorScheme="red"
              onClick={() => handleDelete(notification.id)}
            />
          </HStack>
        </Box>
      ))}
      {(!notificationsResponse?.data.data.length) && (
        <Text textAlign="center" color="gray.500">No notifications</Text>
      )}
    </VStack>
  );
};

export default NotificationList;
