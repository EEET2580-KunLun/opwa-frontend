# EEET2580 - KunLun - OPWA - FrontEnd

### https enforcement
```bash
mkdir ssl
openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 365
```