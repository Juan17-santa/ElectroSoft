import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import ForgotPassword from "../feature/auth/pages/ForgotPassword";
import VerifyCode from "../feature/auth/pages/VerifyCode";
import ResetPassword from "../feature/auth/pages/ResetPassword";
import Layout from "../feature/dashboard/layout";
import Dahsboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/ProductCategory";
import CreateProductCategory from "../feature/dashboard/pages/productCategory/CreateProductCategory";
import Users from "../feature/dashboard/pages/users/Users";
import CreateUser from "../feature/dashboard/pages/users/CreateUser";
import UserDetail from "../feature/dashboard/pages/users/UserDetail";
import EditUser from "../feature/dashboard/pages/users/EditUser";
import Shopping from "../feature/dashboard/pages/shopping/shopping";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import Providers from "../feature/dashboard/pages/providers/Providers";
import Orders from "../feature/dashboard/pages/orders/Orders";
import UpdateProductCategory from "../feature/dashboard/pages/productCategory/UpdateProductCategory";

export default function RoutersApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dahsboard />} />
                <Route path="product-category" element={<ProductCategory />} />
                <Route path="product-category/create" element={<CreateProductCategory />} />

                <Route path="users" element={<Users />} />
                <Route path="users/createUser" element={<CreateUser />} /> 
                <Route path="users/:id" element={<UserDetail />} />        
                <Route path="users/:id/edit" element={<EditUser />} />

                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/create" element={<CreateShopping />} />
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