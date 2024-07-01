import { CRYPTO, STORAGE, SecureStorage } from "@jihyunlab/web-secure-storage";
const privateKey = import.meta.env.VITE_STORAGE_PRIVATE_KEY;

export const storage = {
    async set(key: string, value: any) {
        await localStorage.setItem(key, JSON.stringify(value));
    },
    async get<T>(key: string) {
        const value = await localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : null;
    },
    async remove(key: string) {
        await localStorage.removeItem(key);
    },
};

export const baseSecureStorage = SecureStorage(
    STORAGE.LOCAL,
    CRYPTO.AES,
    privateKey,
    128 /* The number of iterations for PBKDF2 */
);
export const secureStorage = {
    ...baseSecureStorage,
    setPassword: (password: string) => {
        return baseSecureStorage.setItem("password", password);
    },
    set: (key: string, value: any) => {
        return baseSecureStorage.setItem(key, JSON.stringify(value));
    },
    get: async <T>(key: string) => {
        const value = baseSecureStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : null;
    },
};
