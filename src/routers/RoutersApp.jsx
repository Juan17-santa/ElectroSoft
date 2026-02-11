import { Route, Routes } from "react-router-dom";
import Login from "../feature/auth/pages/login";
import Layout from "../feature/dashboard/layout";

export default function RoutersApp() {
    return (
        <Routes>
            <Route path="/" element={ <Login/> }/>
            <Route path="/layout" element={ <Layout/> }/>

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