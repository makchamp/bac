# Scattegories / Bac

## Production

### Install
```
# Move SSH Key into keys/
# Move Git Keys and .env files into transfer/

terraform apply --auto-approve
ssh -i keys/key terraformUser@IP
sudo ./PLaunch.sh

# Set the Domain A record to point to the Instance IP
```
## Server Individually
### Requirements 
- Docker
- (Optional) Nodejs >=18 lts
### Install
```
npm install --prefix /server/
```
### Redis
```
# Example
sudo docker pull redis
sudo docker run -d -p 6379:6379 --name redis_bac redis
```
### Env
```
cp .env.example .env
# Fill .env with personal values
```
### Run in Dev Mode
```
npm run dev
# default server url = http://localhost:4000
```
### Run in Production Mode
```
npm run start | npm start
# default server url = http://localhost:4000
```
## Client Individually
### Install
```
npm install --prefix /client/
```
### Env
```
cp .env.example .env
# Fill .env with personal values
```
### Build
```
npm run build
```
### Run Client Server
```
npm run start | npm start
# default standalone client url: http://localhost:3001
```
