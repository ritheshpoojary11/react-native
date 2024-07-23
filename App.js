// App.js or LocationAccess.js
import React, { useEffect } from 'react';
import Navigation from './src/Navigation';
import { init } from './src/database';// Import the init function

const App = () => {
  useEffect(() => {
    init(); // Initialize the database
    
  }, []);

  return <Navigation />;
};

export default App;
