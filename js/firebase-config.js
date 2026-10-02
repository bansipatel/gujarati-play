/* Cloud sync settings. Leave as null to turn sync off (the Sync section then stays hidden).
 *
 * After creating your Firebase project (README: "Turning on cloud sync"), replace null with:
 *   window.GL_FIREBASE = { apiKey: 'AIza...', projectId: 'your-project-id' };
 *
 * These two values are meant to be public (they ship in every Firebase web app). Protection comes from the
 * Firestore rules in firebase/firestore.rules and from restricting the API key to your site's address.
 */
window.GL_FIREBASE = { apiKey: 'AIzaSyDHDvuN_rasELhIk9xQ885nTWmovvyoaGo', projectId: 'gujarati-play' };
