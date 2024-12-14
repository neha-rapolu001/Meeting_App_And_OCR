import React, { useEffect, useState } from 'react';
import { Text, Burger } from '@mantine/core'; // Import Burger from Mantine
import { useMediaQuery } from '@mantine/hooks'; // Mantine's media query hook
import { getCookie } from '../../api';

const TopBar = ({ isSidebarOpen, toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const isSmallScreen = useMediaQuery('(max-width: 768px)'); // Adjust breakpoint as needed

  useEffect(() => {
    const fetchUserName = () => {
      const name = getCookie('first_name');
      setUserName(name);
    };
    fetchUserName();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between', // Ensure space-between for Burger and the userName
        alignItems: 'center',
        backgroundColor: '#39383b',
        padding: '10px 20px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Burger for Small Screens */}
      {isSmallScreen && (
        <Burger
          opened={isSidebarOpen} // Indicates whether the sidebar is open
          onClick={toggleSidebar} // Toggles sidebar state
          size="sm"
          color="#ffffff" // Adjust icon color
          aria-label="Toggle sidebar"
        />
      )}

      {/* Placeholder for large screens to push "Hello" to the right */}
      <div style={{ flex: 1 }} />

      <Text size="lg" weight={500} style={{ color: '#ffffff' }}>
        {userName ? `Hello, ${userName}!` : 'Loading...'}
      </Text>
    </div>
  );
};

export default TopBar;
