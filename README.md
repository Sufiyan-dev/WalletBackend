# Wallet Backend App
An backend centralised wallet application, which user to send and recieve funds only when they verify themselves. In addition to, it also give new user sigup reward a token and also give wallet address to interact with. And has JWT validation and session.

## How to run and steps 
1. Install all the dependencies
    ```
    npm install 
    ```
2. Adding `.env` file and credentials needed
    - `NODE_ENV` is needed to be define for developer env which is 'dev' or prod will be used for logger
3. Run the express app
    - Dev 
        ```
        npm run dev
        ```
4. to check code error and format by eslint
    check
    ```
    npm run lint
    ```
- Others things
    1. Can check `appError.log` file for any errors if occured


### Folder structure
```
|- app.js : the main file were the app starts
|- src : main folder
    |- api : were the all the api and code stays
        |- controllers : validate input and pass the req to service
        |- logger : better way of log data on console and file
        |- middlewares : checking, auth, and other things
        |- models : use to interact with db
        |- routes : all the routes of app
        |- services : all the logic and db intereaction works
        |- utils : helpers needed in application
        |- validation : input validation 
    |- config : all the configration files stays here
```

## Author
Sufiyan