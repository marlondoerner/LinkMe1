# Welcome to LinkMe

## Functionality

- Navigate (route) from the landingpage to the app (404 Page also implemented)
- Create an unique profile (only possible when unused number chosen) and set
  - a bio
  - a profile picture link
  - your social media links
  - your locations
- View profiles by 
  - searching for profile numbers
  - viewing qr codes of profiles
  - entering a profile link
  - locating them on the map
- Comment profiles
- Validating data when adding profile (client-side)
- Keep the state of the application when restarting (e. g. your Mapbox API key)

## Supabase Database

Data is saved by Supabase JavaScript client created in client.ts to be accessable online:
- Environment variables (e. g. VITE_SUPABASE_URL)
- Postgres tables (e. g. 20251129151309_40c9d35f-379b-4836-affe-b0e3fc58f7f6.sql)

## Mapbox API

To view the map you have to generate an api key at [Mapbox](https://console.mapbox.com).

## Vite Integration

Vite starts a local server to load only changed modules again so you dont need to reload.

## Tailwind CSS

Tailwind CSS provides CSS-Classes for the styling of LinkMe1.

## QRCodeSVG Library

Encodes an URL int QR-code data and renders it as a scalable SVG graphics to display it in a web app.

