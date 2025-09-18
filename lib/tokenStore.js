// Simple in-memory store (for testing only)
const tokenStore = {};

export function saveToken(userId, tokens) {
    tokenStore[userId] = tokens;
}

export function getToken(userId) {
    return tokenStore[userId];
}
