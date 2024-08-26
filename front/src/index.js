import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { ProtectedRoute } from './security/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

import process from 'process';
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Utilisater */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />

        {/* Admin */}
        <Route path="/backOffice" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/backOffice/users" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/backOffice/books" element={<ProtectedRoute element={<Home />} />} />


        {/* Tout le Monde  */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
