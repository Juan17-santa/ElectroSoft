import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import ForgotPassword from "../feature/auth/pages/ForgotPassword";
import VerifyCode from "../feature/auth/pages/VerifyCode";
import ResetPassword from "../feature/auth/pages/ResetPassword";
import Layout from "../feature/dashboard/layout";
import Dashboard from "../feature/dashboard/pages/dashboard/Dashboard";
import ProductCategory from "../feature/dashboard/pages/productCategory/pages/ProductCategory";

import Users from "../feature/dashboard/pages/users/pages/Users";
import UserDetail from "../feature/dashboard/pages/users/pages/UserDetail";
import EditProfile from "../feature/auth/pages/EditProfile";
import CreateUser from "../feature/dashboard/pages/users/pages/CreateUser";
import UpdateUser from "../feature/dashboard/pages/users/pages/UpdateUser";

import Clients from "../feature/dashboard/pages/Clients/Clients";
import CreateClients from "../feature/dashboard/pages/Clients/CreateClients";
import UpdateClients from "../feature/dashboard/pages/Clients/UpdateClients";
import ClientDetailsPage from "../feature/dashboard/pages/Clients/ClientDetailsPage";
import CreateSales from "../feature/dashboard/pages/SalesManagement/CreateSales";
import SalesManagement from "../feature/dashboard/pages/SalesManagement/SalesManagement";
import UpdateSales from "../feature/dashboard/pages/SalesManagement/UpdateSales";
import CreditDetailsModal from "../feature/dashboard/pages/SalesManagement/CreditDetailsModal";
import ReturnSalesPage from "../feature/dashboard/pages/SalesManagement/ReturnSalesPage";
import SaleDetailsPage from "../feature/dashboard/pages/SalesManagement/SaleDetailsPage";
import Roles from "../feature/dashboard/pages/Roles/Roles";
import CreateRoles from "../feature/dashboard/pages/Roles/CreateRoles";
import UpdateRoles from "../feature/dashboard/pages/Roles/UpdateRoles";
import RoleDetailsPage from "../feature/dashboard/pages/Roles/RoleDetailsPage";

import Shopping from "../feature/dashboard/pages/shopping/Shopping";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import ShoppingDetails from "../feature/dashboard/pages/shopping/ShoppingDetails";
import Providers from "../feature/dashboard/pages/providers/pages/Providers";
import CreateProvider from "../feature/dashboard/pages/providers/pages/CreateProvider";
import UpdateProvider from "../feature/dashboard/pages/providers/pages/UpdateProvider";
import Orders from "../feature/dashboard/pages/orders/pages/Orders";
import Products from "../feature/dashboard/pages/products/Products";
import CreateProducts from "../feature/dashboard/pages/products/CreateProducts";
import EditProducts from "../feature/dashboard/pages/products/EditProducts";
import ProductDetails from "../feature/dashboard/pages/products/ProductDetails";
import ProductCategoryDetails from "../feature/dashboard/pages/productCategory/pages/ProductCategoryDetails";
import ProviderDetails from "../feature/dashboard/pages/providers/pages/ProviderDetails";
import Devolutions from "../feature/dashboard/pages/devolutions/pages/Devolutions";
import CreateDevolution from "../feature/dashboard/pages/devolutions/pages/CreateDevolution";
import EditDevolution from "../feature/dashboard/pages/devolutions/pages/EditDevolution";
import DevolutionDetails from "../feature/dashboard/pages/devolutions/pages/DevolutionDetails";
<<<<<<< HEAD
import DevolutionProductDetails from "../feature/dashboard/pages/devolutions/pages/DevolutionProductDetails";
=======
import SaleDevolutionInfo from "../feature/dashboard/pages/devolutions/pages/SaleDevolutionInfo";
import CreateOrder from "../feature/dashboard/pages/orders/pages/CreateOrder"
import Payments from "../feature/dashboard/pages/payments/pages/Payments"
import CreatePayment from "../feature/dashboard/pages/payments/pages/CreatePayment"
import PaymentDetail from "../feature/dashboard/pages/payments/pages/PaymentsDetail"
>>>>>>> 83c2d5c9e925f97d600df8e1470632eeb3ea1bbb

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
                <Route path="sales-management/credit-details" element={<CreditDetailsModal />} />
                <Route path="sales-management/return" element={<ReturnSalesPage />} />
                <Route path="sales-management/details" element={<SaleDetailsPage />} />

                {/* COMPRAS */}
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/create" element={<CreateShopping />} />
                <Route path="shopping/details/:id" element={<ShoppingDetails />} />

                {/* PROVEEDORES */}
                <Route path="providers" element={<Providers />} />
                <Route path="providers/create" element={<CreateProvider />} />
                <Route path="providers/update" element={<UpdateProvider />} />
                <Route path="providers/detail" element={<ProviderDetails />} />

                {/* Usuarios */}
                <Route path="users" element={<Users />} />
                <Route path="users/create" element={<CreateUser />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="users/update/:id" element={<UpdateUser />} />
                <Route path="editprofile" element={<EditProfile />} />

                {/* PRODUCTOS */}
                <Route path="products" element={<Products />} />
                <Route path="products/create" element={<CreateProducts />} />
                <Route path="products/update/:id" element={<EditProducts />} />
                <Route path="products/details/:id" element={<ProductDetails />} />
                
                {/* PEDIDOS */}
                <Route path="orders" element={<Orders />} />
                <Route path="orders/create" element={<CreateOrder />} />

                {/* DEVOLUCIONES */}
                <Route path="devolutions" element={<Devolutions />} />
                <Route path="devolutions/create" element={<CreateDevolution />} />
                <Route path="devolutions/edit/:id" element={<EditDevolution />} />
                <Route path="devolutions/details/:id" element={<DevolutionDetails />} />
                <Route path="devolutions/product-details/:id" element={<DevolutionProductDetails />} />

                {/* PAGOS Y ABONOS */}
                <Route path="payments" element={<Payments />} />
                <Route path="payments/create" element={<CreatePayment />} />
                <Route path="payments/detail/:id" element={<PaymentDetail />} />
                
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