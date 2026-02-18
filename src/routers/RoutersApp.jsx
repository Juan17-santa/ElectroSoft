import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import ForgotPassword from "../feature/auth/pages/ForgotPassword";
import VerifyCode from "../feature/auth/pages/VerifyCode";
import ResetPassword from "../feature/auth/pages/ResetPassword";
import Layout from "../feature/dashboard/layout";
import Dashboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/ProductCategory";
import CreateProductCategory from "../feature/dashboard/pages/productCategory/CreateProductCategory";
import UpdateProductCategory from "../feature/dashboard/pages/productCategory/UpdateProductCategory";
import Users from "../feature/dashboard/pages/users/Users";
import CreateUser from "../feature/dashboard/pages/users/CreateUser";
import UserDetail from "../feature/dashboard/pages/users/UserDetail";
import EditUser from "../feature/dashboard/pages/users/EditUser";
import Shopping from "../feature/dashboard/pages/shopping/shopping";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import ShoppingDetails from "../feature/dashboard/pages/shopping/ShoppingDetails";
import Providers from "../feature/dashboard/pages/providers/Providers";
import CreateProvider from "../feature/dashboard/pages/providers/CreateProvider";
import UpdateProvider from "../feature/dashboard/pages/providers/UpdateProvider";
import Orders from "../feature/dashboard/pages/orders/Orders";




export default function RoutersApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="product-category" element={<ProductCategory />} />
                <Route path="product-category/create" element={<CreateProductCategory />} />
                <Route path="product-category/update" element={<UpdateProductCategory />} />

                <Route path="users" element={<Users />} />
                <Route path="users/createUser" element={<CreateUser />} /> 
                <Route path="users/:id" element={<UserDetail />} />        
                <Route path="users/:id/edit" element={<EditUser />} />
            {/* Compras */}
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/create" element={<CreateShopping />} />

                <Route path="shopping/details/:id" element={<ShoppingDetails />} />


                <Route path="providers" element={<Providers/>}/>
                <Route path="providers/create" element={<CreateProvider/>} />
                <Route path="providers/update" element={<UpdateProvider/>} />


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