import shallow from 'zustand/shallow';
import { useUserStore } from '../stores/user';

export const useProtectedFunc = () => {
  const { isLoggedIn, toggleLoginModal } = useUserStore(
    state => ({ toggleLoginModal: state.toggleLoginModal, isLoggedIn: state.status === 'loggedIn' }),
    shallow,
  );
  return {
    protectFunc: (func: () => void) => {
      if (!isLoggedIn) {
        toggleLoginModal();
        return;
      }
      func();
    },
    isLoggedIn,
  };
};
