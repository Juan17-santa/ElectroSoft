import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import ForgotPassword from "../feature/auth/pages/ForgotPassword";
import VerifyCode from "../feature/auth/pages/VerifyCode";
import ResetPassword from "../feature/auth/pages/ResetPassword";
import Layout from "../feature/dashboard/layout";
import Dashboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/pages/ProductCategory";
import CreateProductCategory from "../feature/dashboard/pages/productCategory/pages/CreateProductCategory";
import UpdateProductCategory from "../feature/dashboard/pages/productCategory/pages/UpdateProductCategory";

import Clients from "../feature/dashboard/pages/Clients/Clients";
import CreateClients from "../feature/dashboard/pages/Clients/CreateClients";
import UpdateClients from "../feature/dashboard/pages/Clients/UpdateClients";
import ClientDetailsPage from "../feature/dashboard/pages/Clients/ClientDetailsPage";
import CreateSales from "../feature/dashboard/pages/SalesManagement/CreateSales";
import SalesManagement from "../feature/dashboard/pages/SalesManagement/SalesManagement";
import UpdateSales from "../feature/dashboard/pages/SalesManagement/UpdateSales";
import CreditDetailsPage from "../feature/dashboard/pages/SalesManagement/CreditDetailsModal";
import ReturnSalesPage from "../feature/dashboard/pages/SalesManagement/ReturnSalesPage";
import SaleDetailsPage from "../feature/dashboard/pages/SalesManagement/SaleDetailsPage";
import Roles from "../feature/dashboard/pages/Roles/Roles";
import CreateRoles from "../feature/dashboard/pages/Roles/CreateRoles";
import UpdateRoles from "../feature/dashboard/pages/Roles/UpdateRoles";
import RoleDetailsPage from "../feature/dashboard/pages/Roles/RoleDetailsPage";

import Users from "../feature/dashboard/pages/users/Users";
import CreateUser from "../feature/dashboard/pages/users/CreateUser";
import UserDetail from "../feature/dashboard/pages/users/UserDetail";
import EditUser from "../feature/dashboard/pages/users/EditUser";
import Shopping from "../feature/dashboard/pages/shopping/Shopping";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import ShoppingDetails from "../feature/dashboard/pages/shopping/ShoppingDetails";
import Providers from "../feature/dashboard/pages/providers/pages/Providers";
import CreateProvider from "../feature/dashboard/pages/providers/pages/CreateProvider";
import UpdateProvider from "../feature/dashboard/pages/providers/pages/UpdateProvider";
import Orders from "../feature/dashboard/pages/orders/Orders";
import Products from "../feature/dashboard/pages/products/Products";
import CreateProducts from "../feature/dashboard/pages/products/CreateProducts";
import EditProducts from "../feature/dashboard/pages/products/EditProducts";
import ProductDetails from "../feature/dashboard/pages/products/ProductDetails";
import ProductCategoryDetails from "../feature/dashboard/pages/productCategory/pages/ProductCategoryDetails";
import ProviderDetails from "../feature/dashboard/pages/providers/pages/ProviderDetails";

export default function RoutersApp() {
    return (
        <Routes>
            {/* ACCESO */}
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                {/* CATEGORIA DE PRODUCTOS */}
                <Route path="productCategory" element={<ProductCategory />} />
                <Route path="productCategory/create" element={<CreateProductCategory />} />
                <Route path="productCategory/update" element={<UpdateProductCategory />} />
                <Route path="productCategory/detail" element={<ProductCategoryDetails />} />

                {/* CLIENTES */}
                <Route path="clients" element={<Clients />} />
                <Route path="clients/create" element={<CreateClients />} />
                <Route path="clients/update" element={<UpdateClients />} />
                <Route path="clients/details" element={<ClientDetailsPage />} />

                {/* ROLES */}
                <Route path="roles" element={<Roles />} />
                <Route path="roles/create" element={<CreateRoles />} />
                <Route path="roles/update" element={<UpdateRoles />} />
                <Route path="roles/details" element={<RoleDetailsPage />} />

                {/* GESTION DE VENTAS */}
                <Route path="sales-management" element={<SalesManagement />} />
                <Route path="sales-management/create" element={<CreateSales />} />
                <Route path="sales-management/update" element={<UpdateSales />} />
                <Route path="sales-management/credit-details" element={<CreditDetailsPage />} />
                <Route path="sales-management/return" element={<ReturnSalesPage />} />
                <Route path="sales-management/details" element={<SaleDetailsPage />} />

                {/* USUARIOS */}
                <Route path="users" element={<Users />} />
                <Route path="users/createUser" element={<CreateUser />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="users/:id/edit" element={<EditUser />} />

                {/* COMPRAS */}
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/create" element={<CreateShopping />} />
                <Route path="shopping/details/:id" element={<ShoppingDetails />} />

                {/* PROVEEDORES */}
                <Route path="providers" element={<Providers />} />
                <Route path="providers/create" element={<CreateProvider />} />
                <Route path="providers/update" element={<UpdateProvider />} />
                <Route path="providers/detail" element={<ProviderDetails />} />

                {/* PRODUCTOS */}
                <Route path="products" element={<Products />} />
                <Route path="products/create" element={<CreateProducts />} />
                <Route path="products/update/:id" element={<EditProducts />} />
                <Route path="products/details/:id" element={<ProductDetails />} />
                {/* PEDIDOS */}
                <Route path="orders" element={<Orders />} />


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