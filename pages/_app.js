import React from "react";

import { AuthProvider } from "../context/AuthContext";

import Navbar from "../components/Navbar";

import "../src/styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />

        <main className="app-main">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}

export default MyApp;