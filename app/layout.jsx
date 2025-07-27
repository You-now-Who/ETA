'use client';

import './globals.css';
import NavBar from '../components/NavBar';
import { Container } from 'reactstrap';
import Footer from '../components/Footer';
import React from 'react';
import { Auth0Provider } from '@auth0/nextjs-auth0';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <Auth0Provider>
          <main id="app" className="d-flex flex-column h-100" data-testid="layout">
            <NavBar />
            <Container className="flex-grow-1 mt-5">{children}</Container>
            {/* <Footer /> */}
          </main>
        </Auth0Provider>
        <script src="/utils/buttonEffects.js"></script>
      </body>
    </html>
  );
}
