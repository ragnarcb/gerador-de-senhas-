import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@password_history';
const SAVED_PASSWORDS_KEY = '@saved_passwords';

// Save a password to history (temporary storage for generated passwords)
export const saveToHistory = async (password) => {
    try {
        // Get existing history
        const existingHistory = await getPasswordHistory();
        
        // Add new password to the list
        const updatedHistory = [{
            id: Math.random().toString(),
            password,
            createdAt: new Date().toISOString()
        }, ...existingHistory].slice(0, 20); // Limit history to 20 items

        // Save updated list
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return true;
    } catch (error) {
        console.error('Error saving password to history:', error);
        return false;
    }
};

// Get password history
export const getPasswordHistory = async () => {
    try {
        const history = await AsyncStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error getting password history:', error);
        return [];
    }
};

// Clear password history
export const clearPasswordHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing password history:', error);
        return false;
    }
};

// Save a password with a name (permanent storage)
export const saveNamedPassword = async (name, password) => {
    try {
        if (!name || !password) {
            throw new Error('Nome e senha são obrigatórios');
        }
        
        // Get existing saved passwords
        const existingSaved = await getSavedPasswords();
        
        // Add new password to the list
        const newPassword = {
            id: Math.random().toString(),
            name,
            password,
            createdAt: new Date().toISOString()
        };
        
        const updatedSaved = [newPassword, ...existingSaved];
        
        // Save updated list
        await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(updatedSaved));
        return true;
    } catch (error) {
        console.error('Error saving named password:', error);
        throw error;
    }
};

// Get saved passwords
export const getSavedPasswords = async () => {
    try {
        const savedPasswords = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
        return savedPasswords ? JSON.parse(savedPasswords) : [];
    } catch (error) {
        console.error('Error getting saved passwords:', error);
        return [];
    }
};

// Delete a saved password
export const deleteSavedPassword = async (passwordId) => {
    try {
        const savedPasswords = await getSavedPasswords();
        const updatedSaved = savedPasswords.filter(pwd => pwd.id !== passwordId);
        await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(updatedSaved));
        return true;
    } catch (error) {
        console.error('Error deleting saved password:', error);
        return false;
    }
};

// Legacy function to maintain compatibility
export const savePassword = async (password) => {
    return saveToHistory(password);
};

export const getPasswords = async () => {
    try {
        const passwords = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
        return passwords ? JSON.parse(passwords) : [];
    } catch (error) {
        console.error('Error getting passwords:', error);
        return [];
    }
};

export const deletePassword = async (passwordId) => {
    try {
        const passwords = await getPasswords();
        const updatedPasswords = passwords.filter(pwd => pwd.id !== passwordId);
        await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(updatedPasswords));
        return true;
    } catch (error) {
        console.error('Error deleting password:', error);
        return false;
    }
};

export const deleteAllPasswords = async () => {
    try {
        await AsyncStorage.removeItem(SAVED_PASSWORDS_KEY);
        return true;
    } catch (error) {
        console.error('Error deleting all passwords:', error);
        return false;
    }
}; 