// authorizeRoles.js

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        // Check if the user is present and if their role is included in the allowed roles
        if (!req.user || !roles.includes(req.user.Role)) {
            return res.status(403).json({ message: 'Access denied. You do not have Authority to access this.' });
        }
        next(); // User is authorized
    };
};

export default authorizeRoles;
