import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';
import RegisterPage from './RegisterPage';

function App() {
  return (
    <Router>
      <div style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;