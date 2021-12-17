## Application structure

server.js:

> calling the database connection function , registering routes and middleware and listening to port 8080

api folder :

> routes : the application routes resides there (auth.route.js file)

> models : mongoose Schema of the user Model (User.js file)

> controllers : where the application logic resides (logging in and registering and getting a new refresh token)

> middleware : middleware functions ==> error handler and cors middleware

> utils : errorResponse class and helper functions to send the refresh and accessToken

config folder:

> contains a db.js file for establishing the connection with the database

error-module folder:

> contains an ErrorResponse class as a module.

.env file (ignored in .gitignore)

> secrets and uris
