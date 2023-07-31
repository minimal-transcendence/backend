import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Callback from "./routes/Callback";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
