import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { IUser, UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const isAdmin = user?.role === UserRole.ADMIN;
  const isAgent = user?.role === UserRole.AGENT;
  const isCustomer = user?.role === UserRole.CUSTOMER;

  return {
    user: user as IUser | null,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isAgent,
    isCustomer,
    dispatch,
  };
};
