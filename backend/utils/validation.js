/**
 * Input validation utility functions
 */

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // Password must be at least 6 characters
    return password && password.length >= 6;
};

const validateRequired = (value) => {
    return value !== undefined && value !== null && value !== '';
};

const validateEnum = (value, allowedValues) => {
    return allowedValues.includes(value);
};

const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const validateTime = (timeString) => {
    // Format: HH:MM:SS or HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timeString);
};

const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim();
    }
    return input;
};

module.exports = {
    validateEmail,
    validatePassword,
    validateRequired,
    validateEnum,
    validateDate,
    validateTime,
    sanitizeInput,
};
