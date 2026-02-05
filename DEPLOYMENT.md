# Deployment Checklist

## Environment Variables
Set these in your hosting platform:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN` (for Turso/libsql)

## Prisma
The `postinstall` script runs `prisma generate`. For migrations:

```
npx prisma migrate deploy
```

## Discord Bot
Make sure the bot is invited to the server with these permissions:

- View Channels
- Send Messages
- Read Message History
- Manage Channels

## Hosted Database (Turso recommended)
1. Create a database in Turso.
2. Copy the database URL and auth token.
3. Set:
   - `DATABASE_URL=libsql://...`
   - `DATABASE_AUTH_TOKEN=...`

## Quick Test
1. Log in.
2. Save profile.
3. Send a request and confirm:
   - DM received
   - Private channel created
