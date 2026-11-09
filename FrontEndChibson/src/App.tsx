import { RouterProvider } from 'react-router';
import { appRouter } from './router/app.router';

// La aplicación solo activa el enrutador; cada página se elige según la URL
export default function App() {
  return <RouterProvider router={appRouter} />;
}
