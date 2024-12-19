import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Canvas from './components/Canvas';
import NotFound from './components/Utilities/NotFound';

function App() {
  return (
    <Router>
      <div className="w-screen h-screen">
        <Routes>
          <Route path="" element={<Canvas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;