import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// ACCESO
import Login from "../feature/auth/pages/login";
const ForgotPassword = lazy(() => import("../feature/auth/pages/ForgotPassword"));
const VerifyCode = lazy(() => import("../feature/auth/pages/VerifyCode"));
const ResetPassword = lazy(() => import("../feature/auth/pages/ResetPassword"));

// DASHBOARD
import Layout from "../feature/dashboard/layout";
const Dashboard = lazy(() => import("../feature/dashboard/pages/dashboard/pages/Dashboard"));

// ========= COMPRAS =========
// CATEGORIA DE PRODUCTOS
const ProductCategory = lazy(() => import("../feature/dashboard/pages/productCategory/pages/ProductCategory"));

// PRODUCTOS
const Products = lazy(() => import("../feature/dashboard/pages/products/pages/Products"));
const CreateProducts = lazy(() => import("../feature/dashboard/pages/products/pages/CreateProducts"));
const EditProducts = lazy(() => import("../feature/dashboard/pages/products/pages/EditProducts"));
const ProductDetails = lazy(() => import("../feature/dashboard/pages/products/pages/ProductDetails"));

// PROVEEDORES
const Providers = lazy(() => import("../feature/dashboard/pages/providers/pages/Providers"));
const CreateProvider = lazy(() => import("../feature/dashboard/pages/providers/pages/CreateProvider"));
const UpdateProvider = lazy(() => import("../feature/dashboard/pages/providers/pages/UpdateProvider"));
const ProviderDetails = lazy(() => import("../feature/dashboard/pages/providers/pages/ProviderDetails"));

// COMPRAS
const Shopping = lazy(() => import("../feature/dashboard/pages/shopping/Shopping"));
const CreateShopping = lazy(() => import("../feature/dashboard/pages/shopping/CreateShopping"));
const ShoppingDetails = lazy(() => import("../feature/dashboard/pages/shopping/ShoppingDetails"));

// ========= VENTAS =========
// CLIENTES
const Clients = lazy(() => import("../feature/dashboard/pages/Clients/Clients"));
const CreateClients = lazy(() => import("../feature/dashboard/pages/Clients/CreateClients"));
const UpdateClients = lazy(() => import("../feature/dashboard/pages/Clients/UpdateClients"));
const ClientDetailsPage = lazy(() => import("../feature/dashboard/pages/Clients/ClientDetailsPage"));

// PEDIDOS
const Orders = lazy(() => import("../feature/dashboard/pages/orders/pages/Orders"));
const CreateOrder = lazy(() => import("../feature/dashboard/pages/orders/pages/CreateOrder"));
const UpdateOrder = lazy(() => import("../feature/dashboard/pages/orders/pages/UpdateOrder"));
const OrderDetails = lazy(() => import("../feature/dashboard/pages/orders/pages/OrderDetails"));

// VENTAS
const SalesManagement = lazy(() => import("../feature/dashboard/pages/SalesManagement/SalesManagement"));
const CreateSales = lazy(() => import("../feature/dashboard/pages/SalesManagement/CreateSales"));
const CreditDetailsModal = lazy(() => import("../feature/dashboard/pages/SalesManagement/CreditDetailsModal"));
const ReturnSalesPage = lazy(() => import("../feature/dashboard/pages/SalesManagement/ReturnSalesPage"));
const SaleDetailsPage = lazy(() => import("../feature/dashboard/pages/SalesManagement/SaleDetailsPage"));

// PAGOS Y ABONOS
const Payments = lazy(() => import("../feature/dashboard/pages/payments/pages/Payments"));
const CreatePayment = lazy(() => import("../feature/dashboard/pages/payments/pages/CreatePayment"));
const PaymentDetail = lazy(() => import("../feature/dashboard/pages/payments/pages/PaymentsDetail"));
const PaymentClientDetail = lazy(() => import("../feature/dashboard/pages/payments/pages/PaymentClientDetail"));

// DEVOLUCIONES
const Devolutions = lazy(() => import("../feature/dashboard/pages/devolutions/pages/Devolutions"));
const CreateDevolution = lazy(() => import("../feature/dashboard/pages/devolutions/pages/CreateDevolution"));
const EditDevolution = lazy(() => import("../feature/dashboard/pages/devolutions/pages/EditDevolution"));
const DevolutionProductDetails = lazy(() => import("../feature/dashboard/pages/devolutions/pages/Devolutionproductdetails"));

//USUARIOS
const Users = lazy(() => import("../feature/dashboard/pages/users/pages/Users"));
const UserDetail = lazy(() => import("../feature/dashboard/pages/users/pages/UserDetail"));
import EditProfile from "../feature/auth/pages/EditProfile";
const CreateUser = lazy(() => import("../feature/dashboard/pages/users/pages/CreateUser"));
const UpdateUser = lazy(() => import("../feature/dashboard/pages/users/pages/UpdateUser"));

// ROLES
const Roles = lazy(() => import("../feature/dashboard/pages/Roles/Roles"));
const CreateRoles = lazy(() => import("../feature/dashboard/pages/Roles/CreateRoles"));
const UpdateRoles = lazy(() => import("../feature/dashboard/pages/Roles/UpdateRoles"));
const RoleDetailsPage = lazy(() => import("../feature/dashboard/pages/Roles/RoleDetailsPage"));

import { ProtectedRoute } from "./ProtectedRoute";

export default function RoutersApp() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Cargando...</div>}>
        <Routes>
            {/* ACCESO */}
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Layout />}>
                <Route index element={<ProtectedRoute scope="Dashboard" action="acceso" element={<Dashboard />} />} />

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
                <Route path="orders/update/:id" element={<ProtectedRoute scope="Pedidos" action="Editar" element={<UpdateOrder />} />} />
                <Route path="orders/detail/:id" element={<ProtectedRoute scope="Pedidos" element={<OrderDetails />} />} />

                {/* GESTION DE VENTAS */}
                <Route path="sales-management" element={<ProtectedRoute scope="Ventas" element={<SalesManagement />} />} />
                <Route path="sales-management/create" element={<ProtectedRoute scope="Ventas" action="Crear" element={<CreateSales />} />} />
                <Route path="sales-management/credit-details/:id" element={<ProtectedRoute scope="Ventas" element={<CreditDetailsModal />} />} />
                <Route path="sales-management/return/:id" element={<ProtectedRoute scope="Ventas" element={<ReturnSalesPage />} />} />
                <Route path="sales-management/details/:id" element={<ProtectedRoute scope="Ventas" element={<SaleDetailsPage />} />} />

                {/* PAGOS Y ABONOS */}
                <Route path="payments" element={<ProtectedRoute scope="Pagos y abonos" element={<Payments />} />} />
                <Route path="payments/client/:documento" element={<ProtectedRoute scope="Pagos y abonos" element={<PaymentClientDetail />} />} />
                <Route path="payments/detail/:id" element={<ProtectedRoute scope="Pagos y abonos" element={<PaymentDetail />} />} />
                <Route path="payments/create" element={<ProtectedRoute scope="Pagos y abonos" action="Crear" element={<CreatePayment />} />} />
                <Route path="payments/create/:id" element={
                    <ProtectedRoute
                        actions={[
                            { scope: "Pagos y abonos", action: "Abonar" },
                            { scope: "Ventas", action: "Abonar" }
                        ]}
                        element={<CreatePayment />}
                    />
                } />

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
        </Suspense>
    )
}

