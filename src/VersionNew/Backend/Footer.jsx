import React from 'react';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`text-center py-3 fixed-bottom border-top ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
      <p className="mb-0">&copy; 2026 Admin Dashboard. Design & Developed by <strong>Hasan Talukder</strong></p>
    </footer>
  );
}

export default Footer;