# Open Meet

Open Google Meet URLs automatically on time.

This Chrome extension queries your Google Calendar events periodically, and
opens Google Meet URLs attached to them automatically when the meeting starts.

The CWS link TBD.

## Privacy policy

In order to make an OAuth2 application public, the verifycation process
requires a public privacy policy that describes the usage of the collected data.

This extension doesn't collect any data. The calendar API is used to get events
from your calendar in order to open Google Meets on time. To see exactly what
the extension does, see `src/background/index.ts`. You have an option to run
this as a local unpacked extension instead. In that case, follow the Local
development section below to create your own OAuth2 application.

## Local development

This extension uses
[chrome.identity](https://developer.chrome.com/docs/extensions/reference/identity/)
API to obtain an OAuth2 token for Google Calendar API. This uses the extension
ID to identify the caller. This extension ID is different from the Chrome Web
Store's distributed extension when you load this as an unpacked extension.
Because of this, the OAuth2 Client ID specified in the `public/manifest.json`
cannot be used for making a request.

In order to get an OAuth2 Client ID that works for your local development, you
need to follow these steps:

1. Create your own Google Cloud Project.
2. Enable Google Calendar API.
3. Configure the OAuth application. It's OK to be a testing app. Add yourself to
   the allowed test user. Add
   `https://www.googleapis.com/auth/calendar.events.readonly` scope.
4. Run `npm run build` (or `npm start`) to build the app. This creates `dist`
   folder.
5. Load an unpacked extension from the `dist` folder.
6. Go to the Extensions page in Chrome, and copy the extension ID.
7. Go back to the Google Cloud Project. Create an OAuth2 Client ID. "APIs &
   Services" -> "Credentials" -> "Create OAuth client ID" -> Choose "Chrome
   app" -> Paste the extension ID to the "Applicaiton ID" field.
8. Copy the OAuth client ID. Replace the client ID in `public/manifest.json`.
9. Rebuild and reload the extension. You'll see an OAuth2 application consent
   screen.

## Attribution

* The icon comes from https://google.github.io/material-design-icons/
