import React, { createContext, useContext, useState } from 'react';

interface NewsletterContextType {
  isSubscribed: boolean;
  subscribe: (email: string) => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

// Initialize synchronously to prevent CLS
const getInitialSubscribedState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('gen-zee-newsletter-subscribed') === 'true';
  } catch {
    return false;
  }
};

export const NewsletterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(getInitialSubscribedState);

  const subscribe = (email: string) => {
    if (email) {
      localStorage.setItem('gen-zee-newsletter-subscribed', 'true');
      setIsSubscribed(true);
    }
  };

  return (
    <NewsletterContext.Provider value={{ isSubscribed, subscribe }}>
      {children}
    </NewsletterContext.Provider>
  );
};

export const useNewsletter = () => {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error('useNewsletter must be used within a NewsletterProvider');
  }
  return context;
};
