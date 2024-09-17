import { useStore } from '@/store/store';
import { jwtDecode } from 'jwt-decode';
import { tokenPayloadSchema } from './tokenUtils';

export const initializeStore = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token)
      const parsedToken = tokenPayloadSchema.parse(decodedToken);
      if (parsedToken.userId === null) throw new Error("invalid userId");

      useStore.getState().setToken(token);
      useStore.getState().setUserId(parsedToken.userId);
      useStore.getState().setName(parsedToken.name);
      useStore.getState().setEmail(parsedToken.email);
      useStore.getState().setIsInitialized(true);
      // console.log('initializing user id', useStore.getState().userId);

      // console.log('initialized user')
      // console.log('userId', useStore.getState().userId)
      // console.log('email', useStore.getState().email)
      // console.log('name', useStore.getState().name)
      // console.log('token', useStore.getState().token)
    } catch (error) {
      console.error("Invalid token or token payload:", error);
    }
  }
};