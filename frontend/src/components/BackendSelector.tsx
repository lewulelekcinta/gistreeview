import React, { useEffect, useState } from 'react';
import { BACKEND_ENDPOINTS, BackendEndpoint, getActiveBackend, setActiveBackend } from '../config/endpoints';

const BackendSelector: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<BackendEndpoint>(
    () => {
      const current = getActiveBackend();
      return Object.entries(BACKEND_ENDPOINTS).find(([_, url]) => url === current)?.[0] as BackendEndpoint || 'LOCAL'
    }
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newEndpoint = event.target.value as BackendEndpoint;
    setActiveEndpoint(newEndpoint);
    setActiveBackend(newEndpoint);
    // Reload the page to apply new backend URL
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
      <select 
        value={activeEndpoint}
        onChange={handleChange}
        className="p-2 rounded border dark:bg-gray-700 dark:text-white"
      >
        <option value="LOCAL">Local Backend</option>
        <option value="PRODUCTION">Production Backend</option>
      </select>
    </div>
  );
};

export default BackendSelector;