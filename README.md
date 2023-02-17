# Wallet Backend App

## App info
### Folder structure
```
|- src : main folder
    |- api : were the all the api and code stays
        |- controllers : 
        |- middlewares : checking, auth, and other things
        |- models : 
        |- routes : all the routes of app
        |- services : 
        |- utils : helpers needed in application
    |- config : all the configration files stays here
```

### example flow 
```
1) index.js - will import all the routes from routes folder
2) routes folder have imported all the controller 
3) controllers uses services for the logic
4) services uses middleware for auth
5) after which it uses models to inereact with DB

```