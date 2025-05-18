Sistema de Reservaciones de Cine - Backend
Descripción
API REST para el sistema de reservaciones de cine que permite gestionar salas, películas, usuarios y reservaciones.
Tecnologías

Node.js
Express
MySQL
JWT para autenticación
QR Code para generación de boletos

Requisitos para desplegar en Railway
Configuración de Railway

Crea una cuenta en Railway
Crea un nuevo proyecto
Añade un servicio de MySQL a tu proyecto
Añade un servicio de GitHub conectado a tu repositorio

Variables de entorno requeridas

JWT_SECRET: String secreto para firmar los tokens JWT
JWT_EXPIRES_IN: Tiempo de expiración de tokens (por defecto: "24h")
CLIENT_URL: URL de tu frontend desplegado

Railway asignará automáticamente las siguientes variables:

PORT: Puerto para el servidor
DATABASE_URL: URL de conexión a MySQL (Railway usa esta variable)
MYSQL_URL: URL alternativa de conexión a MySQL
MYSQLHOST: Host de la base de datos
MYSQLUSER: Usuario de la base de datos
MYSQLPASSWORD: Contraseña de la base de datos
MYSQLDATABASE: Nombre de la base de datos

Pasos para desplegar en Railway

Haz fork/clone de este repositorio
Sube el código a tu repositorio de GitHub
En Railway, crea un nuevo proyecto
Selecciona "Deploy from GitHub"
Selecciona tu repositorio
Railway detectará automáticamente que es una aplicación Node.js
Configura las variables de entorno en la pestaña "Variables"
¡Tu aplicación se desplegará automáticamente!

Endpoints principales

POST /api/auth/register: Registro de usuarios
POST /api/auth/login: Inicio de sesión
GET /api/cinemas: Listar salas de cine
POST /api/reservations: Crear una reserva

Desarrollo local

Copia .env.example a .env y configura las variables
Instala dependencias: npm install
Ejecuta en modo desarrollo: npm run dev
