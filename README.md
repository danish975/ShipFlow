# ShipFlow

ShipFlow is a production-grade event-driven logistics platform.

## Features
- **Frontend**: React, Vite, Tailwind CSS, Redux
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Message Broker**: RabbitMQ

## Dashboard

![ShipFlow Dashboard](docs/dashboard.png)

## Getting Started

1. Clone the repository.
2. Start the local database and message broker:
   ```bash
   docker compose up mongodb rabbitmq -d
   ```
3. Run the backend and frontend locally:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
