import React from 'react';
import { Routes, Route } from 'react-router-dom';

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                        <h1>EDUGATE Global CRM</h1>
                        <p>Frontend is up and running!</p>
                    </div>
                }
            />
        </Routes>
    );
}

export default AppRoutes;
