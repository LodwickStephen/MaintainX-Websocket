const getAuthHeaders = () => {
    const token = process.env.BEARER_TOKEN;
    const orgId = process.env.ORGANIZATION_ID
    if (!token || ! orgId) {
        throw new Error('Bearer token / Organization ID is not set');
    }

    return {
        Authorization: `Bearer ${token}`,
        'x-organization-id': orgId,
        'Content-Type': 'application/json',
    };
};

module.exports = { getAuthHeaders };
