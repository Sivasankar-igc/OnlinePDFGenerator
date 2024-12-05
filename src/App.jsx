import { BrowserRouter, Routes, Route } from "react-router-dom"
import ImageToPDF from "./Components/ImageToPDF"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./CSS/button.css"

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<ImageToPDF />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}