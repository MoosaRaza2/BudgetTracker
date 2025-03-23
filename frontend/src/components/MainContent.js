import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Overview from './pages/Overview';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgeting from './pages/Budgeting';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Data from './pages/Data';
import Support from './pages/Support';

function MainContent() {
  return (
    <main className="flex-grow p-4">
      <Routes>
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgeting" element={<Budgeting />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/data" element={<Data />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </main>
  );
}

export default MainContent; 