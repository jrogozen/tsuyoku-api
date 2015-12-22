## Tsuyoku ##

Tsuyoku is a fitness tracking app that aids in logging gym sessions

### API Routes ###

All routes except POST /users require authentication. Routes that require authorization are labeled.
Authorization is defined as (admin || userMakingRequest === userBeingQueried)

#### User ####

- GET: */users/:id*
fetch user by id

- GET: */users* 
fetch a list of all users

- POST: */users*
create a new user and return

- PUT: */users/:id*
requires authorization. edit existing user information

- DEL: */users/:id*
requires authorization. delete existing user

