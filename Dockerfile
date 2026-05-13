FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

FROM base AS prod-deps
# Frontend ultimately creates a static artifact so we don't need dependencies for it in the final image
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --filter discord-preview

FROM base AS build
# Full install so `astro build` has its dev deps.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/public/ /app/public/
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "pnpm", "start" ]
