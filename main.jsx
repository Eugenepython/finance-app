import './style.css'
import React from 'react'
import Modal from 'react-modal'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
