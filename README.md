# ShipNow API — Pre-entrega Módulo 1

API inicial de **ShipNow** organizada bajo una arquitectura por capas (**Controller → Service → Repository**), con validación de variables de entorno al arranque y constantes inmutables de dominio para las entidades **Products** y **Users**.

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
    │   └── User.js
    ├── repositories/
    │   ├── product.repository.js
    │   └── user.repository.js
    ├── services/
    │   ├── product.service.js
    │   └── user.service.js
    ├── controllers/
    │   ├── product.controller.js
    │   └── user.controller.js
    └── routes/
        ├── product.routes.js
        └── user.routes.js
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

- **Repository (acceso a datos / Mongoose):** es la única capa que conoce Mongoose y ejecuta consultas contra MongoDB. Encapsula filtros por defecto (como excluir registros eliminados o inactivos), proyecciones de campos (`select` / `projection`) y operaciones CRUD sin tomar decisiones de negocio ni manejar `req` o `res`. De este modo, si cambia la forma de consultar o proyectar datos en MongoDB, el impacto queda contenido en el Repository y no se filtra hacia el resto de la aplicación.
- **Service (lógica de negocio):** concentra las reglas del dominio de ShipNow, como validar campos obligatorios, evitar duplicados de `sku` o `email`, comprobar que los roles o estados pertenezcan a las constantes definidas en `src/utils/constants.js` o actualizar automáticamente el estado de un producto si su stock llega a `0`. Al no depender directamente de Mongoose ni del protocolo HTTP, la lógica de negocio resulta más clara, mantenible y fácil de reutilizar o probar.

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
- `PATCH /api/users/:id/role` — Actualizar el rol de un usuario (`ADMIN` / `USER`).