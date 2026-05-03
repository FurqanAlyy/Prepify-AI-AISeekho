# Prepify-AI Security Specification

## Data Invariants
1. A **User Profile** can only be created and updated by the respective authenticated owner.
2. An **Analysis** must contain a valid `matchScore` (0-100) and belongs to a specific user.
3. An **Interview Session** can only be accessed by the candidate who performed it.
4. **Plans** are user-specific and follow a strict schema of daily tasks.
5. `userId` fields in any document must strictly match the `request.auth.uid`.

## The "Dirty Dozen" (Attack Payloads)
1. **Identity Theft**: Attempting to set `userId` to another user's UID during document creation.
2. **Score Inflation**: Attempting to set `matchScore` to 1000 in a `JobAnalysis`.
3. **Privilege Escalation**: Attempting to add an `isAdmin: true` field to a `UserProfile`.
4. **Ghost Fields**: Adding `isVerified: true` to a user profile to bypass future checks.
5. **Collection Scraping**: Authenticated user trying to list all `analyses` without a filter on their `userId`.
6. **Cross-User Read**: User A trying to 'get' an analysis document belongs to User B.
7. **Cross-User Delete**: User A trying to delete User B's interview session.
8. **ID Poisoning**: Using a 2MB string as a document ID.
9. **Spam Creation**: Creating 10,000 `plans` in a single batch (Rate limiting check).
10. **Immutable Field Change**: Trying to update `createdAt` after a document is created.
11. **Type Poisoning**: Sending a string for `matchScore` instead of a number.
12. **Null User ID**: Attempting to create a document with a null `userId` while authenticated.

## Invariant Verification
The `firestore.rules` will enforce that:
- `request.auth.uid` matches the `userId` in the data.
- Input data follows the `isValid[Entity]` schema helpers.
- `update` operations are restricted to specific fields for existing owners.
