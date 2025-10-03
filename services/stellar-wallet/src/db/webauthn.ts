import type sqlite3 from 'sqlite3'
import { connectDB, run, all } from './kyc'

export type WebAuthnCredentialRow = {
	id: number
	user_id: number
	credential_id: string
	public_key: string
	counter: number
	transports: string
	created_at: string
}

export type WebAuthnChallengeRow = {
	id: number
	user_id: number
	challenge: string
	type: 'registration' | 'authentication'
	created_at: string
	expires_at: string
}

export async function initializeWebAuthnCredentialsTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())

	await run(
		conn,
		`
		CREATE TABLE IF NOT EXISTS webauthn_credentials (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			credential_id TEXT NOT NULL,
			public_key TEXT NOT NULL,
			counter INTEGER NOT NULL DEFAULT 0,
			transports TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (user_id) REFERENCES kyc(id) ON DELETE CASCADE
		);
	`,
	)

	await run(
		conn,
		'CREATE UNIQUE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials (credential_id);',
	)
	await run(
		conn,
		'CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials (user_id);',
	)
}

export async function initializeWebAuthnChallengesTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())

	await run(
		conn,
		`
		CREATE TABLE IF NOT EXISTS webauthn_challenges (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			challenge TEXT NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('registration', 'authentication')),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			expires_at TEXT NOT NULL,
			FOREIGN KEY (user_id) REFERENCES kyc(id) ON DELETE CASCADE
		);
	`,
	)

	await run(
		conn,
		'CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON webauthn_challenges (user_id);',
	)
	await run(
		conn,
		'CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_challenge ON webauthn_challenges (challenge);',
	)
}

export async function insertWebAuthnCredential(
	db: sqlite3.Database,
	args: {
		user_id: number
		credential_id: string
		public_key: string
		counter: number
		transports?: string[]
	},
): Promise<void> {
	const sql = `
		INSERT INTO webauthn_credentials (user_id, credential_id, public_key, counter, transports)
		VALUES (?, ?, ?, ?, ?);
	`
	const transports = args.transports ? JSON.stringify(args.transports) : null
	await run(db, sql, [args.user_id, args.credential_id, args.public_key, args.counter, transports])
}

export async function findWebAuthnCredentialsByUserId(
	db: sqlite3.Database,
	userId: number,
): Promise<WebAuthnCredentialRow[]> {
	return await all<WebAuthnCredentialRow>(
		db,
		'SELECT * FROM webauthn_credentials WHERE user_id = ?;',
		[userId],
	)
}

export async function findWebAuthnCredentialByCredentialId(
	db: sqlite3.Database,
	credentialId: string,
): Promise<WebAuthnCredentialRow | null> {
	const rows = await all<WebAuthnCredentialRow>(
		db,
		'SELECT * FROM webauthn_credentials WHERE credential_id = ? LIMIT 1;',
		[credentialId],
	)
	return rows.length ? rows[0] : null
}

export async function updateWebAuthnCredentialCounter(
	db: sqlite3.Database,
	credentialId: string,
	newCounter: number,
): Promise<void> {
	await run(db, 'UPDATE webauthn_credentials SET counter = ? WHERE credential_id = ?;', [
		newCounter,
		credentialId,
	])
}

export async function insertWebAuthnChallenge(
	db: sqlite3.Database,
	args: {
		user_id: number
		challenge: string
		type: 'registration' | 'authentication'
		expiresInSeconds?: number
	},
): Promise<void> {
	const expiresInSeconds = args.expiresInSeconds ?? 120 // 2 minutes default
	const sql = `
		INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
		VALUES (?, ?, ?, datetime('now', '+${expiresInSeconds} seconds'));
	`
	await run(db, sql, [args.user_id, args.challenge, args.type])
}

export async function findAndValidateChallenge(
	db: sqlite3.Database,
	userId: number,
	challenge: string,
	type: 'registration' | 'authentication',
): Promise<WebAuthnChallengeRow | null> {
	const rows = await all<WebAuthnChallengeRow>(
		db,
		`SELECT * FROM webauthn_challenges 
		 WHERE user_id = ? AND challenge = ? AND type = ? 
		 AND datetime('now') < datetime(expires_at)
		 LIMIT 1;`,
		[userId, challenge, type],
	)
	return rows.length ? rows[0] : null
}

export async function deleteWebAuthnChallenge(
	db: sqlite3.Database,
	challengeId: number,
): Promise<void> {
	await run(db, 'DELETE FROM webauthn_challenges WHERE id = ?;', [challengeId])
}

export async function deleteExpiredChallenges(db: sqlite3.Database): Promise<void> {
	await run(db, "DELETE FROM webauthn_challenges WHERE datetime('now') >= datetime(expires_at);")
}
