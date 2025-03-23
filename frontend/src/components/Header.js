import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartLine, faWallet } from '@fortawesome/free-solid-svg-icons';

function Header({ toggleSidebar }) {
  return (
    <header className="bg-black text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="md:hidden mr-4">
          <FontAwesomeIcon icon={faBars} className="text-white" />
        </button>
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-lg mr-3 flex items-center justify-center" style={{width: "36px", height: "36px"}}>
            <FontAwesomeIcon icon={faWallet} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Budget Tracker</h1>
        </div>
      </div>
    </header>
  );
}

export default Header; 