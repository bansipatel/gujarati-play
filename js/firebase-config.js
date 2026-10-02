/* Cloud sync settings. Leave as null to turn sync off (the Sync section then stays hidden).
 *
 * After creating your Firebase project (README: "Turning on cloud sync"), replace null with:
 *   window.GL_FIREBASE = { apiKey: 'AIza...', projectId: 'your-project-id' };
 *
 * These two values are meant to be public (they ship in every Firebase web app). Firestore does not enforce the
 * key for requests its rules allow, so protection comes entirely from the rules in firebase/firestore.rules.
 */
window.GL_FIREBASE = { apiKey: 'AIzaSyDHDvuN_rasELhIk9xQ885nTWmovvyoaGo', projectId: 'gujarati-play' };
