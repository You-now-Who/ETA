'use client';

import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import PageLink from './PageLink';
import AnchorLink from './AnchorLink';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useUser();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" data-testid="navbar">
      {/* Clean White Navbar */}
      <div className="clean-navbar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <PageLink href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200" testId="navbar-home">
                <span style={{ fontFamily: 'Poppins, sans-serif' }}>Verbum</span>
              </PageLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <PageLink 
                  href="/" 
                  className="clean-nav-link"
                  testId="navbar-home"
                >
                  Dashboard
                </PageLink>
                
                {user && (
                  <>
                    <PageLink 
                      href="/csr" 
                      className="clean-nav-link"
                      testId="navbar-csr"
                    >
                      Analytics
                    </PageLink>
                    <PageLink 
                      href="/ssr" 
                      className="clean-nav-link"
                      testId="navbar-ssr"
                    >
                      Projects
                    </PageLink>
                    <PageLink 
                      href="/external" 
                      className="clean-nav-link"
                      testId="navbar-external"
                    >
                      API
                    </PageLink>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:block">
              {!isLoading && !user && (
                <AnchorLink
                  href="/auth/login"
                  className="clean-auth-btn"
                  tabIndex={0}
                  testId="navbar-login-desktop"
                >
                  Log in
                </AnchorLink>
              )}
              
              {user && (
                <div className="relative">
                  <button
                    onClick={toggle}
                    className="flex items-center space-x-3 clean-profile-btn"
                    data-testid="navbar-menu-desktop"
                  >
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-gray-200"
                      decode="async"
                      data-testid="navbar-picture-desktop"
                    />
                    <span className="text-gray-900 font-medium">{user.name}</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 clean-dropdown">
                      <div className="py-2">
                        <PageLink 
                          href="/profile" 
                          className="clean-dropdown-item"
                          testId="navbar-profile-desktop"
                        >
                          👤 Profile
                        </PageLink>
                        <AnchorLink 
                          href="/auth/logout" 
                          className="clean-dropdown-item"
                          testId="navbar-logout-desktop"
                        >
                          🚪 Log out
                        </AnchorLink>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggle}
                className="clean-mobile-btn"
                data-testid="navbar-toggle"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden clean-mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <PageLink href="/" className="clean-mobile-link" testId="navbar-home-mobile">
                Dashboard
              </PageLink>
              
              {user && (
                <>
                  <PageLink href="/csr" className="clean-mobile-link" testId="navbar-csr-mobile">
                    Analytics
                  </PageLink>
                  <PageLink href="/ssr" className="clean-mobile-link" testId="navbar-ssr-mobile">
                    Projects
                  </PageLink>
                  <PageLink href="/external" className="clean-mobile-link" testId="navbar-external-mobile">
                    API
                  </PageLink>
                </>
              )}
              
              {!isLoading && !user && (
                <AnchorLink
                  href="/auth/login"
                  className="clean-mobile-auth-btn"
                  testId="navbar-login-mobile"
                >
                  Log in
                </AnchorLink>
              )}
              
              {user && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full ring-2 ring-gray-200"
                      decode="async"
                      data-testid="navbar-picture-mobile"
                    />
                    <span className="text-gray-900 font-medium" data-testid="navbar-user-mobile">
                      {user.name}
                    </span>
                  </div>
                  <PageLink href="/profile" className="clean-mobile-link" testId="navbar-profile-mobile">
                    👤 Profile
                  </PageLink>
                  <AnchorLink
                    href="/auth/logout"
                    className="clean-mobile-link"
                    testId="navbar-logout-mobile"
                  >
                    🚪 Log out
                  </AnchorLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .clean-navbar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .clean-nav-link {
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .clean-nav-link:hover {
          background: #f9fafb;
          color: #111827;
          text-decoration: none;
        }
        
        .clean-auth-btn {
          background: #111827;
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 1px solid #111827;
          text-decoration: none;
        }
        
        .clean-auth-btn:hover {
          background: #374151;
          text-decoration: none;
          transform: translateY(-1px);
        }
        
        .clean-profile-btn {
          background: #f9fafb;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }
        
        .clean-profile-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        
        .clean-dropdown {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        
        .clean-dropdown-item {
          display: block;
          color: #374151;
          padding: 0.75rem 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .clean-dropdown-item:hover {
          background: #f9fafb;
          color: #111827;
          text-decoration: none;
        }
        
        .clean-mobile-btn {
          color: #374151;
          background: #f9fafb;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        
        .clean-mobile-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        
        .clean-mobile-menu {
          background: white;
          border-top: 1px solid #e5e7eb;
        }
        
        .clean-mobile-link {
          display: block;
          color: #374151;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .clean-mobile-link:hover {
          background: #f9fafb;
          color: #111827;
          text-decoration: none;
        }
        
        .clean-mobile-auth-btn {
          display: block;
          background: #111827;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .clean-mobile-auth-btn:hover {
          background: #374151;
          text-decoration: none;
        }
      `}</style>
    </nav>
  );
};

export default NavBar;
