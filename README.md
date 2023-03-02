# Wallet Backend App
An backend centralised wallet application, which user to send and recieve funds only when they verify themselves. In addition to, it also give new user sigup reward a token and also give wallet address to interact with. And has JWT validation and session.

### Folder structure
```
|- src : main folder
    |- api : were the all the api and code stays
        |- controllers : validate input and pass the req to service
        |- middlewares : checking, auth, and other things
        |- models : use to interact with db
        |- routes : all the routes of app
        |- services : all the logic and db intereaction works
        |- utils : helpers needed in application
    |- config : all the configration files stays here
```

## Author
Sufiyan