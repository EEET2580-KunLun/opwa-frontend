# EEET2580 - KunLun - OPWA - FrontEnd

## https enforcement

```bash
mkdir ssl
openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 365
```

## DOCKER

***Make sure you are in project root***

```bash
docker compose --build -d
```
