import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import Layout from "../feature/dashboard/layout";
import Dahsboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/ProductCategory";
import CreateProductCategory from "../feature/dashboard/pages/productCategory/CreateProductCategory";
import Clients from "../feature/dashboard/pages/Clients/Clients";
import CreateSales from "../feature/dashboard/pages/Sales Management/CreateSales";
import SalesManagement from "../feature/dashboard/pages/Sales Management/SalesManagement";

export default function RoutersApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dahsboard />} />
                <Route path="product-category" element={<ProductCategory />} />
                <Route path="product-category/create" element={<CreateProductCategory />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/create" element={<Clients />} />
                <Route path="createsales" element={<CreateSales />} />
                <Route path="salesmanagement" element={<SalesManagement />} />
            </Route>
         

            {/* AYUDAS PARA LAS RUTAS PRIVADAS, ESTO ES UN EJEMPLO, NO BORRAR */}
            
            {/* Rutas privadas
            <Route element={ <PrivateRoutes/> }>
                <Route path="/dashboard" element={ <Layout/> }>
                    <Route path="reservas" element={ <Reservations/> }/>
                    <Route path="servicios" element={ <Services/> }/>
                    <Route path="clientes" element={ <Clients/> }/>
                </Route>
            </Route> */}
        </Routes>
    )
}