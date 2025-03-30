import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (res,user) => {
    // Generate JWT token
    const token = jwt.sign(
        {user},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );

    // Set the token as a cookie
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

export {generateTokenAndSetCookie};
