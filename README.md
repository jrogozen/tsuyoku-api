## Tsuyoku ##

Tsuyoku is a fitness tracking app that aids in logging gym sessions

### API Routes ###

### Auth ##

- [] POST: */login*
log user in with email, password

- [] POST: */authorize*
trades a refresh_token for a new access_token

### User ###

- [x] GET: */users/:id*
fetch user by id

- [x] GET: */users* 
fetch a list of all users. accepts skip/limit

- [x] POST: */users*
create a new user and return

- [] PUT: */users/:id*
requires authorization. edit existing user information. changing password should reset refresh_token

- [] DEL: */users/:id*
requires authorization. delete existing user

### Workout ###

- [] GET: */workout/:workoutId*
fetch specific workout. requires authentication or authorization?

- [] GET: */workout/byEmail?email=email&type=bench_press&limit=1&sort=weight_desc*
fetch exercises for a given user. requires authorization. requires email. takes limit, sort (sortby_asc/desc), type.

- [] POST: */workout*
create a new workout. requires authorization.

- [] PUT: */workout/:workoutId*
edit an existing workout. requires authorization

- [] DEL: */workout/:workoutId*
requires authorization. delete existing workout

### Format ###

`success (200)`

```
{
    success: true,
    data: data
}
```

`fail (400, 500)`

```
{
    success: false,
    error: message
}
```

### Notes ###
- when doing async mocha tests, you need to `catch` expect errors and fire the done() callback to avoid timeouts

- 404 if a specific id is queried and not found. 200 if query for a list of results and an empty array is returned

- Mongoose re-indexes after creates. you need to ensureIndexes() on the Model to make sure uniques stay unique.

- Only send a new api_access_token on requests that require authorization

1. user makes api call
2. api call checks access_token.
3. if expired, api returns boo hoo.
4. otherwise, api call completes

1. user makes api call that requires authorization
2. api call checks access_token.
3. if access_token is expired, api returns boo hoo
3. otherwise, api call checks refresh_token vs db refresh_token (refresh_tokens should not be stored in cookies. they are stored at the app level once a user logs in)
4. api call completes if match, otherwise returns boo hoo.


user tries and is expires so fails, ( user logs in and receives a new access token || user has a refresh_token stored in the app and uses that to get a new access token), user tries api call again, token passes, refresh_token matches, api call succeeds. note: if a user is an admin, check the refresh_token provided against that admin id's refresh_token instead.