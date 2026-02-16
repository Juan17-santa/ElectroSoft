import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import Layout from "../feature/dashboard/layout";
import Dahsboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/ProductCategory";
import CreateProductCategory from "../feature/dashboard/pages/productCategory/CreateProductCategory";
import Providers from "../feature/dashboard/pages/providers/Providers";
import Orders from "../feature/dashboard/pages/orders/Orders";
import UpdateProductCategory from "../feature/dashboard/pages/productCategory/UpdateProductCategory";

export default function RoutersApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dahsboard />} />
                <Route path="product-category" element={<ProductCategory />} />
                <Route path="product-category/create" element={<CreateProductCategory />} />
                <Route path="product-category/update" element={<UpdateProductCategory />} />

                <Route path="providers" element={<Providers/>}/>

                <Route path="orders" element={<Orders/>}/>
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