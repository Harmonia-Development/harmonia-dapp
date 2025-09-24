# JWT Authentication for Wallet Endpoints

The wallet service now requires JWT authentication. Here's how to use it.

## Quick Setup

1. Set your JWT secret:

```bash
export JWT_SECRET="your-secret-key"
```

2. All `/wallet` endpoints now need a valid JWT token in the Authorization header.

## Making Requests

### Generate a JWT Token

Your auth service should create tokens like this:

```javascript
const jwt = require('jsonwebtoken')
const token = jwt.sign({ user_id: 123 }, process.env.JWT_SECRET, { expiresIn: '1h' })
```

### Call Wallet Endpoints

```bash
curl -X POST http://localhost:3000/wallet/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"user_id": 123}'
```

## Important Notes

- The `user_id` in your JWT payload MUST match the `user_id` in the request body
- Tokens should include `user_id` as a number
- Standard JWT format: `Bearer <token>`

## Error Responses

- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Valid token but user_id doesn't match
- `400 Bad Request` - Business logic errors (user doesn't exist, etc.)

## Example Integration

```javascript
// Frontend example
const response = await fetch('/wallet/create', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${userToken}`,
	},
	body: JSON.stringify({ user_id: currentUser.id }),
})

if (response.status === 401) {
	// Redirect to login
} else if (response.status === 403) {
	// User trying to access wrong account
}
```

That's it. The auth layer handles the rest automatically.
