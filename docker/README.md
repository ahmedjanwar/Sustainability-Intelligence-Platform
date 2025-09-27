# Docker Orchestration

This folder contains Docker configuration to run the entire Sustainability Intelligence Platform locally.

## Quick start

1. Copy the environment template and adjust values if needed:

```bash
cp docker/.env.example docker/.env
```

2. Start services:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

3. View logs:

```bash
docker compose -f docker/docker-compose.yml logs -f
```

4. Stop services:

```bash
docker compose -f docker/docker-compose.yml down
```

## Services

- backend — API/backend application (bind-mounts `Backend/`)
- frontend — Web app (bind-mounts `Frontend/`)
- database — Postgres with init scripts in `docker/database/init/`

## Notes

- Dockerfiles are generic placeholders. Adjust base images/commands to your stack.
- Override `BACKEND_CMD` and `FRONTEND_CMD` in `docker/.env` to start your apps.
- Database data is persisted in volume `db_data`.
