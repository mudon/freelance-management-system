// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Clients } from '@/pages/Clients';
import { ClientDetail } from '@/pages/ClientDetail';
import { Projects } from '@/pages/Projects';
import { Invoices } from '@/pages/Invoices';
import { InvoiceDetail } from '@/pages/InvoiceDetail';
import { Quotes } from '@/pages/Quotes';
import { QuoteDetail } from '@/pages/QuoteDetail';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'clients',
            children: [
              {
                index: true,
                element: <Clients />,
              },
              {
                path: ':id',
                element: <ClientDetail />,
              },
            ],
          },
          {
            path: 'projects',
            children: [
            {
              index: true,
              element: <Projects />,
            },
            {
              path: ':id',
              element: <ProjectDetail />,
            },
          ],
          },
          {
            path: 'invoices',
            children: [
              {
                index: true,
                element: <Invoices />,
              },
              {
                path: ':id',
                element: <InvoiceDetail />,
              },
            ],
          },
          {
            path: 'quotes',
            children: [
              {
                index: true,
                element: <Quotes />,
              },
              {
                path: ':id',
                element: <QuoteDetail />,
              },
            ],
          },
          {
            path: '*',
            element: <NotFound />,
          },
        ],
      },
    ],
  },
]);