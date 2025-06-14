import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import TenziesGame from './components/Tenzies/TenziesGame';
import HomePage from './pages/cms/HomePage';
import EditProfile from './components/EditProfile';
import './assets/custom/app.css';
import './auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<HomePage />} />
          <Route path="/tenzies" element={<TenziesGame />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;