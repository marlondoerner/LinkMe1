# Welcome to LinkMe

## Functionality

- Navigate (route) from the landingpage to the app (404 Page also implemented)
- Create an unique profile (only possible when unused number chosen) and set
  - a bio
  - a profile picture link
  - your social media links
  - your location
- view profiles by 
  - searching for profile numbers
  - viewing qr codes of profiles
  - entering a profile link
  - locating them on the map
- comment profiles
- validating data when adding profile (client-side)
- keep the state of the application when restarting (e. g. your Mapbox API key)

## Database

data is saved by Supabase JavaScript client created in client.ts to be accessable online:
- Environment variables (e. g. VITE_SUPABASE_URL)
- Postgres tables (e. g. 20251129151309_40c9d35f-379b-4836-affe-b0e3fc58f7f6.sql)

## Mapbox API

To view the map you have to generate an api key at [Mapbox](https://console.mapbox.com).

## Authors

Build with lovable.dev by Lina & Marlon
