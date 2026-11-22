# ShipNow API — Pre-entrega Módulo 2 (Mocking y carga de datos)

API de **ShipNow** organizada bajo una arquitectura por capas (**Controller → Service → Repository**), con validación de variables de entorno al arranque, constantes inmutables de dominio y un módulo de **mocking** y **carga controlada de datos de prueba (`seed`)** para usuarios, repartidores, productos, pedidos y entregas.

## Estructura del proyecto

```text
shipnow-api/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── index.js
    │   └── database.js
    ├── utils/
    │   └── constants.js
    ├── models/
    │   ├── Product.js
    │   ├── User.js
    │   ├── Order.js
    │   └── Delivery.js
    ├── repositories/
    │   ├── product.repository.js
    │   ├── user.repository.js
    │   ├── order.repository.js
    │   └── delivery.repository.js
    ├── services/
    │   ├── product.service.js
    │   ├── user.service.js
    │   └── mock.service.js
    ├── controllers/
    │   ├── product.controller.js
    │   ├── user.controller.js
    │   └── mock.controller.js
    └── routes/
        ├── product.routes.js
        ├── user.routes.js
        └── mock.routes.js
```

## Cómo correr el proyecto localmente

### 1. Requisitos previos
- **Node.js** (versión 18 o superior; probado en Node 22).
- **MongoDB** (un clúster en **MongoDB Atlas** o una instancia local/Docker de MongoDB).

### 2. Clonar el repositorio e instalar dependencias

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd shipnow-api
npm install
```

### 3. Configurar las variables de entorno

Copiá el archivo `.env.example` a `.env` y completá los valores reales correspondientes a tu entorno (por ejemplo, tu `MONGODB_URI` de MongoDB Atlas o local):

```bash
cp .env.example .env
```

*(En Windows PowerShell podés usar `Copy-Item .env.example .env`.)*

Variables definidas en `.env`:
- `NODE_ENV`: entorno de ejecución (por ejemplo, `development` o `production`).
- `PORT`: puerto HTTP en el que escuchará el servidor (por defecto `3000`, o el que indiques, como `4000`).
- `MONGODB_URI`: cadena de conexión a MongoDB. Es obligatoria; si falta o está vacía, `src/config/index.js` lanza un error descriptivo al iniciar y detiene el arranque.

> Nota: el archivo `.env` está excluido mediante `.gitignore` y nunca debe subirse al repositorio.

### 4. Levantar el servidor

Para desarrollo (con recarga automática mediante `node --watch`):

```bash
npm run dev
```

Para ejecución estándar:

```bash
npm start
```

Una vez iniciado, el servidor quedará disponible en `http://localhost:<PORT>` (por ejemplo, `http://localhost:4000`).

## Por qué separar la lógica entre Service y Repository

Separar **Service** y **Repository** permite aplicar el principio de responsabilidad única y aislar las reglas del negocio de los detalles de persistencia:

- **Repository (acceso a datos / Mongoose):** es la única capa que conoce Mongoose y ejecuta consultas contra MongoDB. Encapsula filtros por defecto (como excluir registros eliminados o inactivos), proyecciones de campos (`select` / `projection`), operaciones `insertMany` para la carga controlada y consultas CRUD sin tomar decisiones de negocio ni manejar `req` o `res`. De este modo, si cambia la forma de consultar o persistir datos en MongoDB, el impacto queda contenido en el Repository y no se filtra hacia el resto de la aplicación.
- **Service (lógica de negocio y mocking):** concentra las reglas del dominio de ShipNow y la construcción coherente de datos simulados: validar campos obligatorios, evitar duplicados de `sku` o `email`, usar las constantes de `src/utils/constants.js` para roles (`USER`, `COURIER`, `ADMIN`), estados y prioridades de pedidos y estados de entregas, y respetar las relaciones entre entidades (pedido asociado a un usuario/cliente y entrega asociada a un pedido y, cuando corresponde, a un repartidor con rol `COURIER`). Al no depender directamente de Mongoose ni del protocolo HTTP, la lógica resulta más clara, mantenible y fácil de probar.

## Endpoints disponibles

- `GET /health` — Verificación básica del estado del servicio.
- `GET /api/products` — Listar productos activos.
- `GET /api/products/:id` — Obtener un producto por ID.
- `POST /api/products` — Crear un nuevo producto.
- `PATCH /api/products/:id` — Actualizar datos, stock o estado de un producto.
- `DELETE /api/products/:id` — Marcar un producto como eliminado (soft delete).
- `GET /api/users` — Listar usuarios.
- `GET /api/users/:id` — Obtener un usuario por ID.
- `POST /api/users` — Registrar un nuevo usuario.
- `PATCH /api/users/:id/role` — Actualizar el rol de un usuario (`ADMIN` / `USER` / `COURIER`).
- `GET /api/mocks/users?qty=2` — Genera usuarios simulados (incluyendo repartidores) **sin guardar** en MongoDB.
- `GET /api/mocks/orders?qty=3` — Genera pedidos simulados con estados, prioridades y referencia a cliente **sin guardar** en MongoDB.
- `GET /api/mocks/deliveries?qty=3` — Genera entregas simuladas vinculadas a pedidos y repartidores (cuando aplica) **sin guardar** en MongoDB.
- `POST /api/mocks/seed` — Inserta registros de prueba en MongoDB de forma controlada.

## Cómo probar los endpoints de Mocking y Seed

Con el servidor corriendo en `http://localhost:4000`, podés probar los endpoints desde PowerShell:

### 1. Generar datos simulados sin guardar en la base

```powershell
# Usuarios simulados (no se guardan en MongoDB)
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/mocks/users?qty=2"

# Pedidos simulados (no se guardan en MongoDB)
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/mocks/orders?qty=3"

# Entregas simuladas (no se guardan en MongoDB)
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/mocks/deliveries?qty=3"
```

### 2. Insertar registros de prueba en MongoDB (`POST /api/mocks/seed`)

```powershell
# Insertar 10 usuarios de prueba en MongoDB
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/mocks/seed?qty=10"

# Insertar dataset completo relacionado (usuarios, repartidores, productos, pedidos y entregas)
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/mocks/seed?entity=all&qty=5"
```

Entidades soportadas en `entity` para `POST /api/mocks/seed`: `users` (por defecto), `couriers`, `products`, `orders`, `deliveries` y `all`.

## Subir el proyecto a GitHub

Antes de hacer commit y push, verificá con `git status` que ni `node_modules/` ni `.env` estén incluidos (y que `.env.example` sí esté presente):

```powershell
git status
git add .
git commit -m "feat(mocks): modulo de mocking y carga controlada de datos para ShipNow"
git push -u origin main
```