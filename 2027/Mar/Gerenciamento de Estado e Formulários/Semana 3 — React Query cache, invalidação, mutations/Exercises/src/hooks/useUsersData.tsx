import { useQuery } from '@tanstack/react-query';
import type { User } from '../interfaces/user';
import axios from 'axios';

async function fetchUsers() {
  const response = await axios.get<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  );

  return response?.data;
}

export function useUsersData() {
  return useQuery({
    queryKey: ['users-data'],
    queryFn: fetchUsers,
  });
}
