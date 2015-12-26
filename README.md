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

### Format ###

success (200):

{
    success: true,
    data: data
}

fail (40*, 50*):

{
    success: false,
    error: message
}


### Notes ###
- when doing async mocha tests, you need to `catch` expect errors and fire the done() callback to avoid timeouts

- 404 if a specific id is queried and not found. 200 if query for a list of results and an empty array is returned

- Mongoose re-indexes after creates. you need to ensureIndexes() on the Model to make sure uniques stay unique.

- Only send a new api_access_token on requests that require authorization