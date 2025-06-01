import React from 'react';

// RainbowBall component for rendering the animated ball
const RainbowBall = React.forwardRef((props, ref) => (
  // SVG element for the ball with ref for animation
  <svg
    ref={ref}
    className="ball"
    width="50" 
    height="50" 
    viewBox="0 0 200 200" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Define gradients and filters for the ball */}
    <defs>
      {/* Radial gradient for rainbow colors */}
      <radialGradient id="rainbowGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="red"/>
        <stop offset="16%" stopColor="orange"/>
        <stop offset="33%" stopColor="yellow"/>
        <stop offset="50%" stopColor="green"/>
        <stop offset="66%" stopColor="blue"/>
        <stop offset="83%" stopColor="indigo"/>
        <stop offset="100%" stopColor="violet"/>
      </radialGradient>
      {/* Radial gradient for highlight effect */}
      <radialGradient id="highlight" cx="30%" cy="30%" r="30%">
        <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
      {/* Filter for drop shadow effect */}
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#000" floodOpacity="0.3"/>
      </filter>
    </defs>
    {/* Main circle with rainbow gradient and shadow */}
    <circle cx="100" cy="100" r="80" fill="url(#rainbowGradient)" filter="url(#shadow)"/>
    {/* Highlight circle for glossy effect */}
    <circle cx="75" cy="75" r="40" fill="url(#highlight)"/>
  </svg>
));

export default RainbowBall;