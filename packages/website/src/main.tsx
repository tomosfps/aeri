import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Navigation from './components/ui/navigation.tsx'
import App from './App.tsx'
import About from './routes/about/About.tsx'
import Commands from './routes/commands/Commands.tsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigation />,
    children: [
      {
        path: "/",
        element: <App />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "commands",
        element: <Commands />
      }
    ],
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
