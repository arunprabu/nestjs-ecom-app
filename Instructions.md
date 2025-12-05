# NestJS Microservices Monorepo Setup

This guide explains how to structure and set up a clean **NestJS monorepo** for a simple microservices architecture where each service is independently deployable.

---

## 1. Final Project Structure

```
apps/
  api-gateway/
    src/
    tsconfig.app.json
  products/
    src/
    tsconfig.app.json
  orders/
    src/
    tsconfig.app.json
  notifications/
    src/
    tsconfig.app.json

libs/
  common/
    src/

nest-cli.json
package.json
tsconfig.json
```

---

## 2. Create the Root Project

```bash
npm i -g @nestjs/cli
nest new nestjs-ms-app
cd nestjs-ms-app
```

Nest initializes a single app. We convert it into a monorepo.

---

## 3. Convert the Root App into the API Gateway

Move the generated app into the monorepo structure:

```bash
mkdir -p apps/api-gateway
mv src apps/api-gateway/
mv tsconfig.app.json apps/api-gateway/
```

Your main application now lives under:

```
apps/api-gateway
```

---

## 4. Generate Additional Microservices

Run these commands:

```bash
nest g app products
nest g app orders
nest g app notifications
```

Nest will create new apps under `apps/` by default.

---

## 5. Update `nest-cli.json`

Replace your existing `nest-cli.json` with this clean monorepo configuration:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "monorepo": true,
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src",
      "compilerOptions": {
        "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
      }
    },
    "products": {
      "type": "application",
      "root": "apps/products",
      "entryFile": "main",
      "sourceRoot": "apps/products/src",
      "compilerOptions": {
        "tsConfigPath": "apps/products/tsconfig.app.json"
      }
    },
    "orders": {
      "type": "application",
      "root": "apps/orders",
      "entryFile": "main",
      "sourceRoot": "apps/orders/src",
      "compilerOptions": {
        "tsConfigPath": "apps/orders/tsconfig.app.json"
      }
    },
    "notifications": {
      "type": "application",
      "root": "apps/notifications",
      "entryFile": "main",
      "sourceRoot": "apps/notifications/src",
      "compilerOptions": {
        "tsConfigPath": "apps/notifications/tsconfig.app.json"
      }
    }
  }
}
```

This setup clearly defines each microservice.

---

## 6. Add Shared Library

Generate a shared library for DTOs, interfaces, utilities:

```bash
nest g lib common
```

? What prefix would you like to use for the library?
@app.  (you should type this)

You can import from it using:

```ts
import { CreateProductDto } from '@app/common/dto/create-product.dto';
```

---

## 7. Add Start Scripts

In `package.json` add:

```json
"scripts": {
  "start:gateway": "nest start api-gateway",
  "start:products": "nest start products",
  "start:orders": "nest start orders",
  "start:notifications": "nest start notifications"
}
```

Optional combined start:

```bash
npm i -D concurrently
```

```json
"scripts": {
  "start:all": "concurrently \"npm run start:gateway\" \"npm run start:products\" \"npm run start:orders\" \"npm run start:notifications\""
}
```

---

## 8. Port Mapping (Recommended)

Assign predictable ports:

* **API Gateway:** 3000
* **Products:** 3001
* **Orders:** 3002
* **Notifications:** 3003

Update `main.ts` for each microservice:

```ts
await app.listen(3001);
```

---

## 9. Next Steps

Once monorepo setup is working:

* Connect services via HTTP or RabbitMQ
* Add MongoDB using `@nestjs/mongoose`
* Add JWT authentication
* Add DTO validation and shared types
* Add Dockerfiles for each service
* Deploy each service independently

---




npm install @nestjs/mongoose mongoose