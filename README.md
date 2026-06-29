# 🚀 ElectroSoft Frontend

Frontend del sistema **ElectroSoft**, desarrollado con **React** y **Vite**.

Este proyecto proporciona una interfaz gráfica moderna e intuitiva para interactuar con la API REST de ElectroSoft, permitiendo gestionar usuarios, productos, compras, ventas, clientes y los demás módulos del sistema desde una aplicación web.

---

# ⚠️ Importante
>
> Este proyecto **no puede ejecutarse de forma independiente**.
>
> Antes de iniciar el Frontend, es necesario configurar y ejecutar correctamente el **Backend de ElectroSoft**, ya que este proporciona la API REST utilizada por la aplicación.
>
> Durante la primera ejecución del backend se crean automáticamente:
>
> * 📄 Tipos de documento.
> * 🛡️ Roles del sistema.
> * 👤 Usuario administrador.
>
> Si aún no ha configurado el backend, siga primero las instrucciones disponibles en su repositorio:
>
> **ElectroSoft Backend**
>
> ```text
> https://github.com/Juan17-santa/ElectroSoft-Backend
> ```
>
> Una vez el backend esté ejecutándose correctamente, continúe con la instalación del frontend.

---

# ✨ Características

- 🎨 Interfaz moderna desarrollada con React.
- 🔐 Autenticación mediante JWT.
- 👥 Gestión de usuarios.
- 🛡️ Gestión de roles.
- 🏷️ Gestión de categorías.
- 📦 Administración de productos.
- 🏢 Gestión de proveedores.
- 🛒 Registro de compras.
- 👤 Administración de clientes.
- 📑 Gestión de pedidos.
- 💰 Registro de ventas.
- 💳 Gestión de pagos y abonos.
- 🔄 Gestión de devoluciones.
- 📱 Diseño adaptable (Responsive Design).

---

# 🛠️ Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| React | Biblioteca para la construcción de interfaces de usuario. |
| Vite | Herramienta de desarrollo y compilación. |
| JavaScript | Lenguaje principal del proyecto. |
| Tailwind CSS | Framework CSS para el diseño de la interfaz. |
| Axios | Cliente HTTP para consumir la API REST. |
| React Router DOM | Gestión de rutas del Frontend. |
| Lucide React | Biblioteca de iconos. |

---

# 📋 Requisitos previos

Antes de ejecutar el Frontend, asegúrese de haber configurado y ejecutado correctamente el **Backend de ElectroSoft**, siguiendo las instrucciones de su respectivo README.

Verifique que:

* El servidor Backend se encuentre en ejecución.
* MongoDB Atlas esté conectado correctamente.
* El usuario administrador haya sido creado durante la inicialización del Backend.

Una vez el Backend esté funcionando correctamente, podrá continuar con la instalación del Frontend.

---

# 📥 Clonar el repositorio

Una vez el Backend se encuentre correctamente configurado y en ejecución, clone el repositorio del Frontend ejecutando el siguiente comando:

```bash
git clone https://github.com/Juan17-santa/ElectroSoft.git
```

A continuación, ingrese a la carpeta del proyecto:

```bash
cd ElectroSoft
```

Con esto tendrá una copia local del Frontend y podrá continuar con la instalación.

---

# 📦 Instalación de dependencias

Desde la carpeta del proyecto, instale todas las dependencias ejecutando:

```bash
npm install
```

Este comando descargará e instalará automáticamente todas las librerías necesarias definidas en el archivo `package.json`.

Espere a que la instalación finalice antes de continuar con el siguiente paso.

---

# 🚀 Ejecutar la aplicación

Con el Backend en funcionamiento y las dependencias instaladas, inicie el servidor de desarrollo mediante el siguiente comando:

```bash
npm run dev
```

Si todo fue configurado correctamente, Vite iniciará la aplicación y mostrará una dirección similar a la siguiente:

```text
http://localhost:5173
```

Abra esa dirección en su navegador para comenzar a utilizar **ElectroSoft**.

---

# 👤 Inicio de sesión

Al ejecutar el Backend por primera vez, ElectroSoft crea automáticamente un usuario administrador para facilitar el acceso inicial al sistema.

Utilice las siguientes credenciales para iniciar sesión:

| Campo                  | Valor                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Correo electrónico** | [administrador@gmail.com](mailto:administrador@gmail.com) |
| **Contraseña**         | 123456                                                    |

> **Importante:**
>
> * Este usuario se crea automáticamente únicamente durante la primera ejecución del Backend.
> * Una vez dentro del sistema, podrá crear nuevos usuarios, asignar roles y modificar la información del administrador desde el módulo correspondiente.
> * La contraseña del usuario administrador puede cambiarse desde la opción **Editar perfil**, proporcionando la contraseña actual y la nueva contraseña.

---

# ℹ️ Primer acceso al sistema

La pantalla inicial de ElectroSoft corresponde al inicio de sesión.

Después de ingresar con el usuario administrador podrá:

* 👥 Crear nuevos usuarios.
* 🛡️ Crear y administrar roles.
* ✏️ Editar la información del administrador.
* 🔒 Cambiar la contraseña del administrador desde el perfil.
* 🚀 Comenzar a utilizar todos los módulos disponibles del sistema.

El usuario administrador existe únicamente para facilitar la configuración inicial del sistema.


---

# ❓ Solución de problemas

Si la aplicación no funciona correctamente, verifique los siguientes aspectos:

* Que el **Backend de ElectroSoft** se encuentre en ejecución.
* Que MongoDB Atlas esté conectado correctamente.
* Que todas las dependencias hayan sido instaladas mediante `npm install`.
* Que el servidor Frontend esté ejecutándose con `npm run dev`.
* Que no existan errores en la consola del navegador o en la terminal.

La mayoría de los problemas de conexión se deben a que el Backend no está en ejecución o a que ocurrió un error durante su configuración.