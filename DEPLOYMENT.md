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

## Quick Test
1. Log in.
2. Save profile.
3. Send a request and confirm:
   - DM received
   - Private channel created
