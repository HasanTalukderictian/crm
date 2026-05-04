import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Menu from './Menu';
import Header from './Header'; // আপনার হেডার ফাইল
import Footer from './Footer'; // আপনার ফুটার ফাইল

const DashBoard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const mainContentStyle = {
    marginLeft: isOpen ? '250px' : '75px', // স্লাইডারের সাথে সামঞ্জস্য রেখে
    transition: '0.3s',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: darkMode ? '#121212' : '#f4f7f6',
    color: darkMode ? '#fff' : '#000'
  };

  return (
    <div>
      <Menu isOpen={isOpen} darkMode={darkMode} />
      
      <div style={mainContentStyle}>
        <Header 
          toggleSidebar={() => setIsOpen(!isOpen)} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />
        
        <main className="container-fluid p-4 flex-grow-1">
          {/* এখানে HomePage বা VisaManagement রেন্ডার হবে */}
          <Outlet context={[darkMode]} /> 
        </main>
        
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default DashBoard;