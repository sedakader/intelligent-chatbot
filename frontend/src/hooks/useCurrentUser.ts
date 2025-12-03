import { useState, useEffect } from 'react';

interface CurrentUser {
  id: string;
  email: string;
}

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        
        console.log('Loading user from localStorage:', { userId, userEmail });
        
        if (userId && userId !== 'undefined' && userEmail) {
          setCurrentUser({ id: userId, email: userEmail });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setUser = (user: CurrentUser | null) => {
    if (user) {
      console.log('Setting user:', user);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      setCurrentUser(user);
    } else {
      console.log('Clearing user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      setCurrentUser(null);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  return {
    currentUser,
    setUser,
    clearUser,
    isLoading,
    userId: currentUser?.id,
  };
};
