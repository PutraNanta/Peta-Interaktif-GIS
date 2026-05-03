import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';

function App() {
  return (
    <Router>
      <div style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<MapComponent isAdminMode={false} />} />
          <Route path="/admin" element={<MapComponent isAdminMode={true} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;