import { Route, Routes } from "react-router-dom";

// ACCESO
import Login from "../feature/auth/pages/login";
import ForgotPassword from "../feature/auth/pages/ForgotPassword";
import VerifyCode from "../feature/auth/pages/VerifyCode";
import ResetPassword from "../feature/auth/pages/ResetPassword";

// DASHBOARD
import Layout from "../feature/dashboard/layout";
import Dashboard from "../feature/dashboard/pages/dashboard/pages/Dashboard";

// ========= COMPRAS =========
// CATEGORIA DE PRODUCTOS
import ProductCategory from "../feature/dashboard/pages/productCategory/pages/ProductCategory";

// PRODUCTOS
import Products from "../feature/dashboard/pages/products/pages/Products";
import CreateProducts from "../feature/dashboard/pages/products/pages/CreateProducts";
import EditProducts from "../feature/dashboard/pages/products/pages/EditProducts";
import ProductDetails from "../feature/dashboard/pages/products/pages/ProductDetails";

// PROVEEDORES
import Providers from "../feature/dashboard/pages/providers/pages/Providers";
import CreateProvider from "../feature/dashboard/pages/providers/pages/CreateProvider";
import UpdateProvider from "../feature/dashboard/pages/providers/pages/UpdateProvider";
import ProviderDetails from "../feature/dashboard/pages/providers/pages/ProviderDetails";

// COMPRAS
import Shopping from "../feature/dashboard/pages/shopping/Shopping";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import ShoppingDetails from "../feature/dashboard/pages/shopping/ShoppingDetails";

// ========= VENTAS =========
// CLIENTES
import Clients from "../feature/dashboard/pages/Clients/Clients";
import CreateClients from "../feature/dashboard/pages/Clients/CreateClients";
import UpdateClients from "../feature/dashboard/pages/Clients/UpdateClients";
import ClientDetailsPage from "../feature/dashboard/pages/Clients/ClientDetailsPage";

// PEDIDOS
import Orders from "../feature/dashboard/pages/orders/pages/Orders";
import CreateOrder from "../feature/dashboard/pages/orders/pages/CreateOrder"
import OrderDetails from "../feature/dashboard/pages/orders/pages/OrderDetails"

// VENTAS
import SalesManagement from "../feature/dashboard/pages/SalesManagement/SalesManagement";
import CreateSales from "../feature/dashboard/pages/SalesManagement/CreateSales";
import CreditDetailsModal from "../feature/dashboard/pages/SalesManagement/CreditDetailsModal";
import ReturnSalesPage from "../feature/dashboard/pages/SalesManagement/ReturnSalesPage";
import SaleDetailsPage from "../feature/dashboard/pages/SalesManagement/SaleDetailsPage";

// PAGOS Y ABONOS
import Payments from "../feature/dashboard/pages/payments/pages/Payments"
import CreatePayment from "../feature/dashboard/pages/payments/pages/CreatePayment"
import PaymentDetail from "../feature/dashboard/pages/payments/pages/PaymentsDetail"
import PaymentClientDetail from "../feature/dashboard/pages/payments/pages/PaymentClientDetail"

// DEVOLUCIONES
import Devolutions from "../feature/dashboard/pages/devolutions/pages/Devolutions";
import CreateDevolution from "../feature/dashboard/pages/devolutions/pages/CreateDevolution";
import EditDevolution from "../feature/dashboard/pages/devolutions/pages/EditDevolution";
import DevolutionProductDetails from "../feature/dashboard/pages/devolutions/pages/Devolutionproductdetails";

//USUARIOS
import Users from "../feature/dashboard/pages/users/pages/Users";
import UserDetail from "../feature/dashboard/pages/users/pages/UserDetail";
import EditProfile from "../feature/auth/pages/EditProfile";
import CreateUser from "../feature/dashboard/pages/users/pages/CreateUser";
import UpdateUser from "../feature/dashboard/pages/users/pages/UpdateUser";

// ROLES
import Roles from "../feature/dashboard/pages/Roles/Roles";
import CreateRoles from "../feature/dashboard/pages/Roles/CreateRoles";
import UpdateRoles from "../feature/dashboard/pages/Roles/UpdateRoles";
import RoleDetailsPage from "../feature/dashboard/pages/Roles/RoleDetailsPage";

import { ProtectedRoute } from "./ProtectedRoute";

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
                <Route path="productCategory" element={<ProtectedRoute scope="Categoria de productos" element={<ProductCategory />} />} />

                {/* PRODUCTOS */}
                <Route path="products" element={<ProtectedRoute scope="Productos" element={<Products />} />} />
                <Route path="products/create" element={<ProtectedRoute scope="Productos" action="Crear" element={<CreateProducts />} />} />
                <Route path="products/update/:id" element={<ProtectedRoute scope="Productos" action="Editar" element={<EditProducts />} />} />
                <Route path="products/details/:id" element={<ProtectedRoute scope="Productos" element={<ProductDetails />} />} />

                {/* PROVEEDORES */}
                <Route path="providers" element={<ProtectedRoute scope="Proveedores" element={<Providers />} />} />
                <Route path="providers/create" element={<ProtectedRoute scope="Proveedores" action="Crear" element={<CreateProvider />} />} />
                <Route path="providers/update/:id" element={<ProtectedRoute scope="Proveedores" action="Editar" element={<UpdateProvider />} />} />
                <Route path="providers/detail/:id" element={<ProtectedRoute scope="Proveedores" element={<ProviderDetails />} />} />

                {/* COMPRAS */}
                <Route path="shopping" element={<ProtectedRoute scope="Compras" element={<Shopping />} />} />
                <Route path="shopping/create" element={<ProtectedRoute scope="Compras" action="Crear" element={<CreateShopping />} />} />
                <Route path="shopping/details/:id" element={<ProtectedRoute scope="Compras" element={<ShoppingDetails />} />} />

                {/* CLIENTES */}
                <Route path="clients" element={<ProtectedRoute scope="Clientes" element={<Clients />} />} />
                <Route path="clients/create" element={<ProtectedRoute scope="Clientes" action="Crear" element={<CreateClients />} />} />
                <Route path="clients/update" element={<ProtectedRoute scope="Clientes" action="Editar" element={<UpdateClients />} />} />
                <Route path="clients/details" element={<ProtectedRoute scope="Clientes" element={<ClientDetailsPage />} />} />

                {/* PEDIDOS */}
                <Route path="orders" element={<ProtectedRoute scope="Pedidos" element={<Orders />} />} />
                <Route path="orders/create" element={<ProtectedRoute scope="Pedidos" action="Crear" element={<CreateOrder />} />} />
                <Route path="orders/detail" element={<ProtectedRoute scope="Pedidos" element={<OrderDetails />} />} />

                {/* GESTION DE VENTAS */}
                <Route path="sales-management" element={<ProtectedRoute scope="Ventas" element={<SalesManagement />} />} />
                <Route path="sales-management/create" element={<ProtectedRoute scope="Ventas" action="Crear" element={<CreateSales />} />} />
                <Route path="sales-management/credit-details" element={<ProtectedRoute scope="Ventas" element={<CreditDetailsModal />} />} />
                <Route path="sales-management/return" element={<ProtectedRoute scope="Ventas" element={<ReturnSalesPage />} />} />
                <Route path="sales-management/details" element={<ProtectedRoute scope="Ventas" element={<SaleDetailsPage />} />} />

                {/* PAGOS Y ABONOS */}
                <Route path="payments" element={<ProtectedRoute scope="Pagos y abonos" element={<Payments />} />} />
                <Route path="payments/client/:documento" element={<ProtectedRoute scope="Pagos y abonos" element={<PaymentClientDetail />} />} />
                <Route path="payments/detail/:id" element={<ProtectedRoute scope="Pagos y abonos" element={<PaymentDetail />} />} />
                <Route path="payments/create" element={<ProtectedRoute scope="Pagos y abonos" action="Crear" element={<CreatePayment />} />} />
                <Route path="payments/create/:ventaId" element={<ProtectedRoute scope="Pagos y abonos" action="Crear" element={<CreatePayment />} />} />

                {/* DEVOLUCIONES */}
                <Route path="devolutions" element={<ProtectedRoute scope="Devoluciones" element={<Devolutions />} />} />
                <Route path="devolutions/create" element={<ProtectedRoute scope="Devoluciones" action="Crear" element={<CreateDevolution />} />} />
                <Route path="devolutions/edit/:id" element={<ProtectedRoute scope="Devoluciones" action="Editar" element={<EditDevolution />} />} />
                <Route path="devolutions/product-details/:id" element={<ProtectedRoute scope="Devoluciones" element={<DevolutionProductDetails />} />} />

                {/* Usuarios */}
                <Route path="users" element={<ProtectedRoute scope="Usuarios" element={<Users />} />} />
                <Route path="users/create" element={<ProtectedRoute scope="Usuarios" action="Crear" element={<CreateUser />} />} />
                <Route path="users/:id" element={<ProtectedRoute scope="Usuarios" element={<UserDetail />} />} />
                <Route path="/dashboard/users/:id/update" element={<ProtectedRoute scope="Usuarios" action="Editar" element={<UpdateUser />} />} />
                <Route path="editprofile" element={<EditProfile />} />

                {/* ROLES */}
                <Route path="roles" element={<ProtectedRoute scope="Roles" element={<Roles />} />} />
                <Route path="roles/create" element={<ProtectedRoute scope="Roles" action="Crear" element={<CreateRoles />} />} />
                <Route path="roles/update" element={<ProtectedRoute scope="Roles" action="Editar" element={<UpdateRoles />} />} />
                <Route path="roles/details" element={<ProtectedRoute scope="Roles" element={<RoleDetailsPage />} />} />

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

