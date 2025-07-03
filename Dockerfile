FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=false

COPY . .

# Build
RUN yarn build

# rm useless stuff
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R botuser:nodejs /app

USER botuser

CMD ["yarn", "start"]