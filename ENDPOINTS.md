## Api document for all endpoints for this api

#### Account
##### Register a new user
```http
POST /api/v1/auth/register
```
Registers a new user with firstName, lastName username,email and password. Returns userid on successful registration.
##### Sign in a user
```http
POST /api/v1/auth/signin
```
Sign in a user with username and password. Returns access,refresh tokens and user-information on successful login.
##### Update access token with refresh token
```http
POST /api/v1/auth/refresh
```
Refreshes the access token using a valid refresh token.
**Requires:** Body with refresh token.
##### Update account information
```http
POST /api/v1/auth/update
```
Updates the current user's account details.
**Requires:** Authorization header with access token.
##### Delete account
```http
POST /api/v1/auth/delete
```
Deletes the authenticated user's account.
**Requires:** Authorization header with access token.

#### Travels
##### Get all public travels
```http
GET /api/v1/travels/allTravels
```
Fetches a list of publicly shared travel entries.
##### Get all travels for current user
```http
GET /api/v1/travels
```
Returns travels created by the authenticated user.
**Requires:** Authorization header with access token.

##### Get a specific travel by ID
```http
GET /api/v1/travels/:id
```
Fetches a specific travel owned by the authenticated user.
**Requires:** Authorization header with access token.

##### Create a new travel
```http
POST /api/v1/travels
```
Creates a new travel entry. Requires a body payload like:

```json
{
  "destination": "Portugal",
  "transport": "flight",
  "notes": "2 week surf trip to the coast of Portugal",
  "startDate": "2025-06-15",
  "endDate": "2025-06-29",
  "location": {"lng": -9.1393, "lat": 38.7223},
  "isPublic": true
}
```
**Requires:** Authorization header with access token.

##### Update an existing travel
```http
PATCH /api/v1/travels/:id
```
Updates the specified travel (owned by user). Partial updates supported.
**Requires:** Authorization header with access token.

##### Delete a travel
```http
DELETE /api/v1/travels/:id
```
Deletes the travel entry.
**Requires:** Authorization header with access token.

##### Access place routes
```http
GET /api/v1/travels/:id/places
```
Nested routes for handling places tied to a specific travel. See Places section for more details.
**Requires:** Authorization header with access token.

### Places
All place routes are nested under /api/v1/travels/:id/places and are protected, except for the public places endpoint.

##### Get all places from public travels
```http
GET /api/v1/travels/places/public-places
```
Returns all places from all travels that are marked as isPublic: true.
##### Get all places for a specific travel
http
Kopiera
Redigera
GET /api/v1/travels/:id/places
Returns all places added to the travel with the given :id.
**Requires:** Authorization header with access token.

##### Get a specific place by ID
http
```
GET /api/v1/travels/:id/places/:placeId
```
Returns a single place belonging to the specified travel.
**Requires:** Authorization header with access token.

##### Add a place to a travel
http
```
POST /api/v1/travels/:id/places
```
Adds a new place to the specified travel.
**Requires:** Authorization header with access token.

###### Example Request Body
```json
{
  "name": "Praia do Amado",
  "description": "Beautiful beach for surfing on the Algarve coast.",
  "location": {
    "lat": 37.1701,
    "lng": -8.8896
  },
  "dateVisited": "2025-06-17",
  "funFacts": [
    "Popular surf competition site",
    "Accessible parking nearby"
  ],
  "rating": 5
}
```
 travelId is inferred from the route :id param and does not need to be sent in the body.
**Requires:** Authorization header with access token.

##### Update a place from a travel
```http
PATCH /api/v1/travels/:id/places/:placeId
```
Updates a specific place’s details. Supports partial updates.
**Requires:** Authorization header with access token.

##### Example Partial Body
```json
{
  "rating": 4,
  "description": "Updated description for the place."
}
```
##### Delete a place from a travel
```http
DELETE /api/v1/travels/:id/places/:placeId
```
Deletes a specific place from the given travel.
**Requires:** Authorization header with access token.