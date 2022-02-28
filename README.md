# bac
Scattegories

## Server 
- Requirements Nodejs >=12, npm
- Redis

### Install
#### Node server
```
cd server
npm i
```
#### Redis
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
```


## Client
React app
### Install
```
cd client
npm i
```
### Run
```
npm start
# default standalone client url: http://localhost:3000
```

### Build
```
npm run build
# default server url serving build as static files http://localhost:4000
```

