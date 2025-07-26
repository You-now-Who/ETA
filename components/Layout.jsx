import React from 'react';
import Head from 'next/head';

import NavBar from './NavBar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <>
    <Head>
      <link rel="stylesheet" href="https://cdn.auth0.com/js/auth0-samples-theme/1.0/css/auth0-theme.min.css" />
      <title>Verbum - Task Management</title>
    </Head>
    <div id="app" className="min-h-screen relative" data-testid="layout">
      <NavBar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  </>
);

export default Layout;
