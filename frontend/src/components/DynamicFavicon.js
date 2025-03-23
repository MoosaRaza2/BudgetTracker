import React, { useEffect } from 'react';

const DynamicFavicon = () => {
  useEffect(() => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw a budget-related icon
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, '#34d399'); // green-400
    gradient.addColorStop(1, '#3b82f6'); // blue-500
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    // Dollar sign or chart icon
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 16, 16);
    
    // Set the favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL('image/x-icon');
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return null;
};

export default DynamicFavicon; 