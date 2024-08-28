import React from 'react';

const Storage = ({ totalStorage, remainingStorage }) => {
    
  const usedStorage = totalStorage - remainingStorage;
  console.log(remainingStorage, 'remainingStorage');
  const remainingPercentage = (remainingStorage / totalStorage) * 100;
  const usedPercentage = (usedStorage / totalStorage) * 100;

  const formatStorage = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2); // Convert to MB and format
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Espace restant: {formatStorage(remainingStorage)} MB</span>
        <span>Total: {formatStorage(totalStorage)} MB</span>
      </div>
      <div style={{
        height: '20px',
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '10px'
      }}>
        <div style={{
          height: '100%',
          width: `${usedPercentage}%`,
          backgroundColor: '#d3d3d3', // Used storage part (grey)
          float: 'left'
        }} />
        <div style={{
          height: '100%',
          width: `${remainingPercentage}%`,
          backgroundColor: '#4caf50', // Remaining storage part (green)
          float: 'left'
        }} />
      </div>
    </div>
  );
};

export default Storage;
