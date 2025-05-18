import { API_CONFIG, LINE_ENDPOINTS } from '../../../app/config/Api'

export async function isLineNameUnique(name) {
    if (!name) return true
    const res = await fetch(
        `${API_CONFIG.BASE_URL}${LINE_ENDPOINTS.CHECK_NAME}?name=${encodeURIComponent(name)}`
    )
    if (!res.ok) return true
    const { exists } = await res.json()
    return !exists
}

export const nameValidationRules = (originalName = '') => ({
    required: 'Line name is required',
    validate: async (value) => {
        const trimmed = value.trim()
        if (!trimmed) return 'Line name is required'
        if (trimmed === originalName) return true
        return (await isLineNameUnique(trimmed)) || 'Line name already exists'
    }
})

export const statusValidationRules = {
    required: 'Status is required'
}

export const frequencyValidationRules = {
    required: 'Frequency is required',
    min: { value: 1, message: 'Frequency must be at least 1 minute' },
    max: { value: 60, message: 'Frequency must not exceed 60 minutes' }
}

export const stationsValidationRules = {
    validate: (value) =>
        (Array.isArray(value) && value.length >= 2) ||
        'A metro line must have at least two stations'
}