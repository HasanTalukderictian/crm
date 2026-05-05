import React from 'react';
import { FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`py-3 fixed-bottom border-top ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        
        {/* Left Side: Copyright Text */}
        <p className="mb-0">
          &copy; 2026 Admin Dashboard. Design & Developed by{" "}
          <a 
            href="https://hasan-portfilo.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              textDecoration: 'none', 
              fontWeight: 'bold',
              color: '#0d6efd' 
            }}
          >
            Hasan Talukder
          </a>
        </p>

        {/* Right Side: Social Icons */}
        <div className="d-flex gap-3 mt-2 mt-md-0">
          <a 
            href="https://www.facebook.com/share/1B2FJmjHWg/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={darkMode ? 'text-white' : 'text-dark'}
            style={{ fontSize: '1.2rem' }}
          >
            <FaFacebook />
          </a>
          <a 
            href="https://www.linkedin.com/in/js-hasan-talukder/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={darkMode ? 'text-white' : 'text-dark'}
            style={{ fontSize: '1.2rem' }}
          >
            <FaLinkedin />
          </a>
          <a 
            href="https://www.youtube.com/@busycoder8650" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ff0000', fontSize: '1.2rem' }}
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;