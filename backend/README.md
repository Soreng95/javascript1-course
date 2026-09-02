# Rainy Days Backend

NestJS REST API serving the Rainy Days product catalogue and a simulated checkout.
Content is authored in Sanity; the frontend consumes this service as a plain REST API.

## Getting started

```bash
npm install
cp .env.example .env
npm run start:dev
```

- API base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Endpoints

| Method | Path                  | Description                                        |
| ------ | --------------------- | -------------------------------------------------- |
| GET    | `/api/health`         | Service health check                                |
| GET    | `/api/products`       | List products, with filtering and sorting           |
| GET    | `/api/products/tags`  | Every tag used across the catalogue                 |
| GET    | `/api/products/:id`   | Single product by id                                |
| POST   | `/api/orders`         | Place a simulated order, returns a confirmation     |
| GET    | `/api/orders/:id`     | Retrieve a previously placed order                  |

### Product query parameters

| Parameter     | Type                                     | Example        |
| ------------- | ---------------------------------------- | -------------- |
| `gender`      | `Male` \| `Female`                       | `?gender=Male` |
| `tag`         | string                                   | `?tag=womens`  |
| `baseColor`   | string                                   | `?baseColor=Black` |
| `size`        | string                                   | `?size=M`      |
| `onSale`      | boolean                                  | `?onSale=true` |
| `search`      | string, matches title and description     | `?search=jacket` |
| `sort`        | `title` \| `price` \| `discountedPrice`  | `?sort=price`  |
| `order`       | `asc` \| `desc`                          | `?order=desc`  |
| `limit`       | number, 1-100                            | `?limit=6`     |

Parameters combine, so `?gender=Female&onSale=true&sort=price&order=asc` is valid.
Unknown parameters and invalid values return `400` with a descriptive message.

### Placing an order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":"97e77845-a485-4301-827f-51b673d4230f","quantity":2,"size":"M"}]}'
```

The response contains an order id, the resolved product for each line, quantities,
`subtotal`, `savings` and `total`. Orders are held in memory and are intended to back
the checkout confirmation screen.

### Error format

Every error uses the same shape:

```json
{
  "statusCode": 404,
  "message": "No product found with id \"unknown\"",
  "path": "/api/products/unknown",
  "timestamp": "2026-09-02T10:31:30.391Z"
}
```

## Sanity

Sanity is the content source and is used only for authoring products. The API reads
from it and exposes the result as REST, so the frontend never talks to Sanity.

When `SANITY_PROJECT_ID` is unset, or a Sanity query fails or returns nothing, the API
falls back to the bundled catalogue in `src/data/products.seed.ts`, so the service runs
without any Sanity credentials.

### Connecting a project

Set the following in `.env`:

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_TOKEN=optional-read-token
```

A read token is only needed for private datasets.

### Studio

`sanity-studio/` holds the product schema and studio config. To run it:

```bash
npm create sanity@latest -- --project <id> --dataset production
```

then copy `sanity-studio/schemaTypes` and `sanity-studio/sanity.config.ts` into the
generated studio.

### Importing the catalogue

`sanity-studio/seed.ndjson` contains the 12 Rainy Days products as Sanity documents.
Regenerate it with `npm run sanity:export-seed`, then import from the studio directory:

```bash
npx sanity dataset import seed.ndjson production
```

## CORS

`CORS_ORIGIN` accepts a comma separated list of allowed origins. When unset, all
origins are allowed, which is convenient while developing the frontend locally.

## Scripts

| Script                      | Description                                |
| --------------------------- | ------------------------------------------ |
| `npm run start:dev`         | Start in watch mode                        |
| `npm run build`             | Compile to `dist/`                         |
| `npm run start:prod`        | Run the compiled build                     |
| `npm run sanity:export-seed`| Regenerate `sanity-studio/seed.ndjson`     |
| `npm run lint`              | Lint and autofix                           |
| `npm run format`            | Format with Prettier                       |
