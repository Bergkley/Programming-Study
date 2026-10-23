import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { User } from '../interfaces/user';

const createUser = async (user: User): Promise<User> => {
  const response = await axios.post<User>(
    'https://jsonplaceholder.typicode.com/users',
    user
  );

  return response.data;
};

export function useUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,

    onSuccess: (newUser) => {
      queryClient.setQueryData<User[]>(['users-data'], (oldUsers) => [
        ...(oldUsers ?? []),
        newUser,
      ]);
    },
  });
}
