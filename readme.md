# Installation Guide

1. Install Docker

On windows we recommend [docker desktop](https://www.docker.com/products/docker-desktop/)

2. run the image via docker on the commandline

```
docker run -p4000:4000 -it mariavillafane/regui:latest
```

alternatively you can download this [compose.yml](https://github.com/mariavillafane/registration-ui/blob/main/compose.yml) file and execute it via

`docker compose up`
