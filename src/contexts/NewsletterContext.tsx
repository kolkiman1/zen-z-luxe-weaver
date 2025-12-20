import React, { createContext, useContext, useState, useEffect } from 'react';

interface NewsletterContextType {
  isSubscribed: boolean;
  subscribe: (email: string) => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export const NewsletterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem('zen-z-newsletter-subscribed');
    if (subscribed === 'true') {
      setIsSubscribed(true);
    }
  }, []);

  const subscribe = (email: string) => {
    if (email) {
      localStorage.setItem('zen-z-newsletter-subscribed', 'true');
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
