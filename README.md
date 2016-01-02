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

- [x] PUT: */users/:id*
requires authorization. edit existing user information. changing password should reset refresh_token

- [x] DEL: */users/:id*
requires authorization. delete existing user

### Workout ###

- [X] GET: */workouts/:workoutId*
fetch specific workout. requires authentication, no authorization

- [X] GET: */workouts/byUser?userId=123&routine=5/3/1&type=bench_press&limit=1*
fetch exercises for a given user. requires authorization. requires email. takes limit, sort (sortby_asc/desc), type.

- [X] POST: */workouts*
create a new workout. requires authorization.

- [] PUT: */workouts/:workoutId*
edit an existing workout. requires authorization

- [] DEL: */workouts/:workoutId*
requires authorization. delete existing workout

### Guide ###

- [] GET: */guide?routineName=5/3/1&lifts=
returns workout guide based on routine (name, week, options) and 1rep maxes. info should be passed in, is not queried (user agnostic).


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

- user tries and token is expired and fails, (user logs in and receives a new access token || user has a refresh_token stored in the app and uses that to get a new access token), user tries api call again, token passes, api call succeeds.

- factories clean/validate data (do we have enough data?) before it is is saved by mongoose model, which does pre-save event (hash pw, update timestamps)

example save for 5/3/1 workout

workout.post({
    routine: {
        name: '5/3/1',
        week: 3,
        options: {
            accessory: 'boring but big'
        }
    }
    },
    lifts: [
        {name: 'bench press', weight: [150, 150, 150, 150, 150, 170, 170, 170, 190]}
    ],

    // do we need this in db?
    accessory_lifts: [
        {name: 'bench press', weight: [100]}
    ]
}
})