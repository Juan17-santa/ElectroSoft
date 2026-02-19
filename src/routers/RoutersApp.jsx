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
import Clients from "../feature/dashboard/pages/Clients/Clients";
import CreateClients from "../feature/dashboard/pages/Clients/CreateClients";
import UpdateClients from "../feature/dashboard/pages/Clients/UpdateClients";
import ClientDetailsPage from "../feature/dashboard/pages/Clients/ClientDetailsPage";
import CreateSales from "../feature/dashboard/pages/Sales Management/CreateSales";
import SalesManagement from "../feature/dashboard/pages/Sales Management/SalesManagement";
import UpdateSales from "../feature/dashboard/pages/Sales Management/UpdateSales";
import CreditDetailsPage from "../feature/dashboard/pages/Sales Management/CreditDetailsModal";
import ReturnSalesPage from "../feature/dashboard/pages/Sales Management/ReturnSalesPage";
import SaleDetailsPage from "../feature/dashboard/pages/Sales Management/SaleDetailsPage";
import Roles from "../feature/dashboard/pages/Roles/Roles";
import CreateRoles from "../feature/dashboard/pages/Roles/CreateRoles";
import UpdateRoles from "../feature/dashboard/pages/Roles/UpdateRoles";
import RoleDetailsPage from "../feature/dashboard/pages/Roles/RoleDetailsPage";
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
import Products from "../feature/dashboard/pages/products/Products";
import CreateProducts from "../feature/dashboard/pages/products/CreateProducts";
import EditProducts from "../feature/dashboard/pages/products/EditProducts";


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
                <Route path="clients" element={<Clients />} />
                <Route path="clients/create" element={<CreateClients />} />
                <Route path="clients/update" element={<UpdateClients />} />
                <Route path="clients/details" element={<ClientDetailsPage />} />
                <Route path="roles" element={<Roles />} />
                <Route path="roles/create" element={<CreateRoles />} />
                <Route path="roles/update" element={<UpdateRoles />} />
                <Route path="roles/details" element={<RoleDetailsPage />} />
                <Route path="sales-management" element={<SalesManagement />} />
                <Route path="sales-management/create" element={<CreateSales />} />
                <Route path="sales-management/update" element={<UpdateSales />} />
                <Route path="sales-management/credit-details" element={<CreditDetailsPage />} />
                <Route path="sales-management/return" element={<ReturnSalesPage />} />
                <Route path="sales-management/details" element={<SaleDetailsPage />} />
                <Route path="users" element={<Users />} />
                <Route path="users/createUser" element={<CreateUser />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="users/:id/edit" element={<EditUser />} />
                {/* Compras */}
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/create" element={<CreateShopping />} />
                <Route path="shopping/details/:id" element={<ShoppingDetails />} />
                <Route path="providers" element={<Providers />} />
                <Route path="providers/create" element={<CreateProvider />} />
                <Route path="providers/update" element={<UpdateProvider />} />
                <Route path="orders" element={<Orders />} />
                {/* Productos */}
                <Route path="products" element={<Products />} />
                <Route path="products/create" element={<CreateProducts />} />
                <Route path="products/update/:id" element={<EditProducts />} />
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