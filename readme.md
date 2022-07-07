# Usage of lerna with moleculerJS
This project represents an experimentation of how to use lerna together with moleculerjs.

# Setup steps
Run the following command

```
npm run init
```

# Run microservices locally
To run the microservices locally you need to follow the following steps:

1. Place the respective `.env` files in the auth and other packages (you will find the related `template.env` files in the folders).
2. Run the following command:
    ```
    npm run dev
    ```

# Run microservices inside docker
To run the microservices inside a docker container you need to follow the following steps:

1. In the `docker-compose.yml` file insert the `PRIVATE_JWT_KEY` enviroment variable under the token service.
2. Run the following command:
    ```
    npm run compose:build
    ```

# References
- [lerna](https://lerna.js.org/)
- [moleculerJS](https://moleculer.services/)