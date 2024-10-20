const getAuthHeaders = () => {
    const token = process.env.BEARER_TOKEN;

    if (!token) {
        throw new Error('Bearer token is not set');
    }

    return {
        Authorization: `Bearer ${token}`,
        'x-organization-id': orgId,
        'Content-Type': 'application/json',
    };
};

module.exports = { getAuthHeaders };
