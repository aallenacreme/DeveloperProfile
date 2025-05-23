import React from 'react';

function Die({ value, isHeld, isMismatched, hold }) {
  return (
    <button
      className={`die ${isHeld ? 'held' : ''} ${isMismatched ? 'mismatched' : ''}`}
      onClick={hold}
    >
      {value}
    </button>
  );
}

export default Die;
