export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn)$/;
    return emailRegex.test(email);
};

export const validateUsername = (username) => {
    if (!username) {
        return false;
    }

    if (username.length < 6) {
        return false;
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
};

/**
 * At least 8 characters
 * At least one uppercase letter
 * At least one lowercase letter
 * At least one digi
 * At least one special character
 * */
export const validatePassword = (password) => {
    // Check minimum length
    if (password.length < 8) {
        return false;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check for digits
    if (!/[0-9]/.test(password)) {
        return false;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        return false;
    }

    return true;
};

export const validateName = (name) => {
    if (!name || name.length > 50) {
        return false;
    }

    // Regex for English and Vietnamese characters with diacritics
    // Includes letters like à, Ô, ê, Ừ, ơ and spaces
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;

    return nameRegex.test(name);
};

/**
 * 12 digits in total
 * Only numbers
 * */
export const validateNationalID = (nationalId) => {
    // Check if it's exactly 12 digits
    const nationalIdRegex = /^\d{12}$/;
    return nationalIdRegex.test(nationalId);
};

export const validateDOB = (dob) => {
    // Check format
    const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dob.match(dobRegex);

    if (!match) {
        return false;
    }

    // Extract day, month, year from the match
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
    const year = parseInt(match[3], 10);

    // Create date object and check if it's valid
    const dateObj = new Date(year, month, day);
    if (
        dateObj.getDate() !== day ||
        dateObj.getMonth() !== month ||
        dateObj.getFullYear() !== year
    ) {
        // Date is invalid (e.g., 30/02/2000)
        return false;
    }

    // Check if person is at least 18 years old
    const today = new Date();
    const minDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    );

    return dateObj <= minDate;
};

export const validatePhone = (phone) => {
    // Remove spaces for validation
    const cleanPhone = phone.replace(/\s/g, '');

    // Vietnamese phone number: 10 digits starting with 0
    const phoneRegex = /^0\d{9}$/;

    return phoneRegex.test(cleanPhone);
};

export const validateAddress = (addressPart) => {
    if (!addressPart) {
        return false;
    }

    // Allow letters, numbers, spaces, commas, periods, hyphens, and forward slashes
    const addressRegex = /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s,./-]+$/;

    return addressRegex.test(addressPart);
};

export const validateFileSize = (file) => {
    // 5MB in bytes
    const maxSize = 5 * 1024 * 1024;
    return file.size <= maxSize;
};

export const validateFileType = (file) => {
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type);
};

