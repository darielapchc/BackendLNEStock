# FixIt Backend — Sesión 1: Setup + Módulo de Autenticación (JWT manual)

## 1. Estructura de carpetas (y por qué es así)

```
fixit-backend/
├── src/
│   ├── config/          # Configuración de infraestructura (BD, futuro: Redis, Cloudinary)
│   ├── models/           # Definición de tablas (Sequelize) — la "forma" de los datos
│   ├── repositories/     # Única capa que sabe hablar con Sequelize
│   ├── services/         # Lógica de negocio pura, sin conocer HTTP
│   ├── controllers/      # Traducen HTTP -> llamadas al Service
│   ├── middlewares/      # Validación, autenticación, manejo de errores
│   ├── routes/           # Definición de endpoints + reglas de validación
│   ├── utils/             # Funciones puras reutilizables (hash, jwt)
│   ├── app.js             # Configuración de Express (sin arrancar el servidor)
│   └── server.js          # Punto de entrada: conecta BD y levanta el puerto
├── .env.example
├── .gitignore
└── package.json
```

**Regla mental para el estudiante:** una petición HTTP siempre viaja en una sola dirección:

```
Route → Middleware (validación/auth) → Controller → Service → Repository → Model → BD
```

Y la respuesta regresa por el mismo camino, en reversa. Si en algún punto sientes la tentación de "saltarte una capa" (ej: llamar a Sequelize directo desde un Controller), es una señal de que se está rompiendo la arquitectura.

## 2. Setup paso a paso

```bash
# 1. Clonar / crear el proyecto y entrar a la carpeta
cd fixit-backend

# 2. Instalar dependencias
npm install

# 3. Crear tu archivo de variables de entorno
cp .env.example .env

# 4. Editar .env con tus credenciales locales de MySQL
#    (asegúrate de haber creado la base de datos antes: )
#    mysql -u root -p -e "CREATE DATABASE fixit_dev;"

# 5. Generar secretos JWT reales (ejecuta esto dos veces, uno para cada variable)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 6. Levantar el servidor en modo desarrollo
npm run dev
```

Si todo salió bien, deberías ver en consola:
```
✅ Conexión a MySQL establecida correctamente.
🔄 Modelos sincronizados con la base de datos.
🚀 Servidor FixIt corriendo en http://localhost:4000
```

## 3. Probar el flujo completo (con curl o Postman)

**Registro:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ana Torres","email":"ana@example.com","password":"password123","role":"client"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"ana@example.com","password":"password123"}'
```
(`-c cookies.txt` guarda la cookie httpOnly del refreshToken para el siguiente paso)

**Ruta protegida (usando el accessToken devuelto por login):**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <PEGA_AQUI_EL_ACCESS_TOKEN>"
```

**Refresh (usando la cookie guardada):**
```bash
curl -X POST http://localhost:4000/api/auth/refresh -b cookies.txt -c cookies.txt
```

## 4. Buenas prácticas aplicadas en esta sesión

- Arquitectura en capas: cada archivo tiene una sola responsabilidad (SRP de SOLID).
- El Repository aísla el ORM — cambiar de Sequelize a otra cosa el día de mañana no debería tocar Services ni Controllers.
- Contraseñas nunca en texto plano (bcrypt, 12 salt rounds).
- Dos secretos JWT distintos (access/refresh) para limitar el impacto de una fuga.
- Refresh token en cookie `httpOnly` + `secure` + `sameSite=strict` — nunca en `localStorage`.
- Rotación de refresh token: cada `/refresh` invalida el anterior y emite uno nuevo.
- Mensajes de error genéricos en login (no revelar si el correo existe o no).
- Manejo de errores centralizado (`errorHandler.js`), no try/catch repetido por todos lados.
- Variables de entorno para todo dato sensible o dependiente del entorno.

## 5. Errores comunes que vamos a revisar en clase (code review)

- Guardar el `accessToken` en `localStorage` en el frontend (lo veremos en la Sesión 2 de Nuxt) — vulnerable a robo vía XSS.
- Olvidar `credentials: true` en CORS y preguntarse por qué la cookie nunca llega al backend.
- Poner datos sensibles dentro del payload del JWT pensando que "está encriptado" (solo está firmado, es legible por cualquiera).
- Comparar contraseñas con `===` en vez de `bcrypt.compare` (nunca vas a poder comparar así, el hash es distinto cada vez aunque la contraseña sea la misma — buen momento para explicar qué es el salt).
- No manejar el caso `TokenExpiredError` distinto de un token simplemente inválido — el frontend necesita saber si debe intentar refrescar o mandar al usuario al login.

## 6. Reto para los estudiantes

Sobre este mismo módulo, implementar:

1. El endpoint `POST /api/auth/logout-all` que use `authService.logoutAllDevices()` (ya existe el método en el Service — solo falta exponerlo).
2. Una validación adicional en `register`: rechazar contraseñas que sean iguales al email (error común de seguridad en usuarios reales).
3. Un `console.log` temporal en el middleware `authenticate` que imprima cuántas peticiones fallidas de autenticación ha habido en los últimos 5 minutos (esto es la antesala conceptual de rate limiting con Redis, que veremos más adelante).

**Criterios de aceptación** (como en un ticket real):
- [ ] `POST /auth/logout-all` requiere estar autenticado (usa el middleware `authenticate`).
- [ ] Revoca TODOS los refresh tokens del usuario, no solo el actual.
- [ ] Devuelve 204 sin contenido, igual que `logout`.
- [ ] Incluye al menos un caso de prueba manual documentado (captura de Postman o comando curl) en el Pull Request.

## 7. Preguntas de reflexión

- Si moviéramos la validación de `express-validator` desde las rutas hacia dentro del Service, ¿qué ventaja y qué desventaja tendría?
- El Repository de usuarios no tiene ningún método `delete`. ¿Es un descuido, o podría ser una decisión de diseño intencional en una plataforma como FixIt? ¿Qué harías en su lugar si un usuario pide "borrar mi cuenta"?
- ¿Por qué el `refreshToken` se revoca (rotación) en cada uso, pero el `accessToken` no se revoca nunca — simplemente expira?
