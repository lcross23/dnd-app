import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
// ...other imports

function AppTabs() {
  const location = useLocation();
  const tabValue =
    location.pathname === "/" ? 0 :
    location.pathname === "/itracking" ? 1 :
    location.pathname === "/condition" ? 2 :
    location.pathname === "/spell" ? 3 :
    false;

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={tabValue === false ? 0 : tabValue}>
        <Tab component={NavLink} to="/" label="Home" />
        <Tab component={NavLink} to="/itracking" label="Itracking" />
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
        <Route path="/itracking" element={<Itracking />} />
        <Route path="/condition" element={<Condition />} />
        <Route path="/spell" element={<Spell />} />
      </Routes>
    </Router>
  );
}

export default App;
