export const hasRole = (user, roles) => {
    return roles.includes(user?.role);
};