// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig : {
    apiKey: "AIzaSyDhlYHky1AZIfLOgfIhmYVhjma2DU3QURI",
    authDomain: "geophoto-2020.firebaseapp.com",
    databaseURL: "https://geophoto-2020.firebaseio.com",
    projectId: "geophoto-2020",
    storageBucket: "geophoto-2020.appspot.com",
    messagingSenderId: "1059223010911",
    appId: "1:1059223010911:web:fe545090fc1a900338a5ea",
    measurementId: "G-3MSBQ9THN9"
  },
  entriesCollection: 'Entry', 
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
