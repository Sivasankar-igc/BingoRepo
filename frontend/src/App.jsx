import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "./homePage";
import GamePage from "./GamePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="gamePage" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;