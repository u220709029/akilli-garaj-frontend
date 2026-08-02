import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import VehicleDetail from './pages/VehicleDetail'; // Yeni import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} /> {/* Yeni rota tanımı */}
      </Routes>
    </Router>
  );
}

export default App;