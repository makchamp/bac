# bac
Scattegories

## Server 
### Requirements 
- Nodejs >=12, npm
- Redis (or Docker)

### Install

## Client
React app
### Install
```
cd client
npm i
```

### Setup build time environment variables 
```
cp .env.example .env
# Fill .env or keep empty (uses default values)
```

### Build
```
npm run build
# default server url serving build as static files http://localhost:4000
```


### Run development server
```
npm start
# default standalone client url: http://localhost:3000
```

## Server
```
cd server
npm i
```
### Redis
```
# With docker
sudo docker pull redis
sudo docker run -d -p 6379:6379 --name redis_bac redis
# Restart after stop
sudo docker start redis_bac
```
### Env
```
cp .env.example .env
# Fill .env or keep empty (uses default values)
```
### Run
```
npm run dev
# default server url serving client build http://localhost:4000 
```
