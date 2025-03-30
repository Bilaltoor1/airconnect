// import { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {AuthProvider} from './context/AuthContext.jsx';

import {Toaster} from 'react-hot-toast';
import {QueryClient, QueryClientProvider} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";

const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AuthProvider>
            <Toaster/>
            <App/>
        </AuthProvider>
    </QueryClientProvider>,
    /*</StrictMode>,*/
);