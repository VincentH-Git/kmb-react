import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BusDetails from './components/BusDetails';
import BusListing from './components/BusListing';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BusListing />}></Route>
          <Route path="/:stopId/:route/:service/:direction" element={<BusDetails />}></Route>


        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
