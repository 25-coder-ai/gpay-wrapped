import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Processing from './pages/Processing';
import Story from './pages/Story';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/story" element={<Story />} />
      </Routes>
    </Router>
  );
}

export default App;
