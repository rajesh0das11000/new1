# Security Specification for Aura

## Data Invariants
1. A user can only create one profile with their own UID.
2. A user can only like someone else (not themselves).
3. A match can only exist between two distinct users who have mutually liked each other (or one liked, and it was promoted).
4. Messages can only be sent by users who are part of the match.
5. Users cannot modify other users' profiles.
6. `createdAt` fields are immutable.
7. `updatedAt` must be set to `request.time`.

## The "Dirty Dozen" Payloads (Denial Expected)

1. **Identity Spoofing (Profile)**: Creating a profile with a different user's UID.
   ```json
   { "uid": "victim_uid", "displayName": "Attacker" }
   ```
2. **State Shortcutting (Match)**: Forcibly creating a "matched" status without a mutual like.
   ```json
   { "userIds": ["attacker", "victim"], "status": "matched" }
   ```
3. **Ghost Field Injection**: Adding `isAdmin: true` to a profile.
   ```json
   { "uid": "attacker", "displayName": "Attacker", "isAdmin": true }
   ```
4. **Self-Like**: Liking your own profile to trigger logic.
   ```json
   { "fromId": "attacker", "toId": "attacker" }
   ```
5. **Unauthorized Message**: Sending a message to a match you are not part of.
   ```json
   { "senderId": "attacker", "text": "spam" } // sent to /matches/abc/messages where attacker not in userIds
   ```
6. **Immutable Field Bypass**: Trying to change `createdAt` on an update.
   ```json
   { "createdAt": "2000-01-01T00:00:00Z" }
   ```
7. **PII Leakage**: Reading another user's private settings (if we had a private subcollection).
8. **ID Poisoning**: Using a 2MB string as a document ID.
9. **Timestamp Spoofing**: Setting `updatedAt` to a future date from the client.
10. **Orphaned Message**: Sending a message to a non-existent match.
11. **Gender Preference bypass**: Swiping on someone outside of stated preferences (logic check in app, but rules help).
12. **Status Locking bypass**: Updating a "blocked" match to "matched".

## Test Runner (Logic Verification)
(Tests would go here in a full TDD cycle)
