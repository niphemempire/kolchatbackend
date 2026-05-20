import User from '../../models/user.model.js';

export const usersRoute = async (req, res) => {
    try {
        const query = String(req.query.q || '').trim();

        if (!query) {
            return res.status(200).json([]);
        }

        const usernameRegex = new RegExp(query, 'i');

        const users = await User.find({
            username: usernameRegex,
            _id: { $ne: req.user._id },
        })
            .select('_id username profilePicture')
            .limit(20)
            .lean();

        const results = users.map(user => ({
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture || '',
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Unable to search users' });
    }
};
