import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";

import Screens from "./pages/Screens/Screens";
import Content from "./pages/Content/Content";
import Media from "./pages/Media/Media";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/screens" element={<Screens />} />
          <Route path="/content" element={<Content />} />
          <Route path="/media" element={<Media />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;