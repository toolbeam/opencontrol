import { createHash } from "crypto"

/**
 * Hashes a password using SHA-256
 * @param password The password to hash
 * @param salt Optional salt to use for hashing
 * @returns The hashed password
 */
export function hashPassword(password: string, salt: string = ""): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

/**
 * Verifies a password against a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @param salt Optional salt used for hashing
 * @returns Whether the password matches the hash
 */
export function verifyPassword(password: string, hash: string, salt: string = ""): boolean {
  const hashedPassword = hashPassword(password, salt)
  return hashedPassword === hash
}
