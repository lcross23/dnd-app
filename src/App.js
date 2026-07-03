import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";
import Condition from "./pages/conditions";
import Initiative from "./pages/initiative";
import Spell from "./pages/spells";
import Home from "./pages/home";

function AppTabs() {
  const location = useLocation();
  const tabValue =
    location.pathname === "/" ? 0 :
    location.pathname === "/initiative" ? 1 :
    location.pathname === "/condition" ? 2 :
    location.pathname === "/spell" ? 3 :
    false;

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={tabValue === false ? 0 : tabValue}>
        <Tab component={NavLink} to="/" label="Home" />
        <Tab component={NavLink} to="/initiative" label="Initiative" />
        <Tab component={NavLink} to="/condition" label="Conditions" />
        <Tab component={NavLink} to="/spell" label="Spells" />
      </Tabs>
    </Box>
  );
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AppTabs />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/initiative" element={<Initiative />} />
        <Route path="/condition" element={<Condition />} />
        <Route path="/spell" element={<Spell />} />
      </Routes>
    </Router>
  );
}

export default App;
