# Setup

To run the application, please follow these steps:

1. Make sure you have Docker installed on your machine.

2. Clone the repository to your local machine:

  ```shell
  git clone https://github.com/cedraz/micro-saas-base-api
  ```

3. Navigate to the project directory:

  ```shell
  cd micro-saas-base-api
  ```

4. Create a `.env` file in the root directory following the `.env.example` file and add the following environment variables:

  ```plaintext
  NODE_ENV=dev
  PORT=3000
  DATABASE_URL=postgresql://johndoe:randompassword@localhost:5432/mydb
  ACCESS_TOKEN_SECRET=
  REFRESH_TOKEN_SECRET=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GOOGLE_AUTH_CALLBACK_URL=
  MAIL_HOST='smtp.gmail.com'
  MAIL_PORT=587
  MAIL_USER= # email
  MAIL_PASS= # senha de aplicativo
  MAIL_SECURE=false
  ```

5. Run the docker compose:

  ```shell
  docker compose up
  ```

6. Run the migrations:

  ```shell
  npx prisma migrate dev
  ```

7. To run the API server, run the following command:

  ```shell
  npm run start:dev
  ```

  The server will be running on `http://localhost:3000`.

8. To access the documentation, navigate to `http://localhost:3000/docs`.

9. To access the prisma studio, run the following command:

  ```shell
  npx prisma studio
  ```

10. To check linting and run tests, run the following command:

  ```shell
  npm run lint
  npm run test:e2e
  ```

11. To stop the docker, run the following command:

  ```shell
  docker compose down
  ```

