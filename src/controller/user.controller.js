import User from '../../models/user.model.js';

const publicUserFields = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    profilePicture: user.profilePicture || '',
    bio: user.bio || '',
});

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
            .select('_id username fullName profilePicture bio')
            .limit(20)
            .lean();

        res.status(200).json(users.map(publicUserFields));
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Unable to search users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            'fullName username profilePicture bio'
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(publicUserFields(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Unable to fetch user profile' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilePicture } = req.body;
        const updates = {};

        if (fullName !== undefined) {
            const trimmed = String(fullName).trim();
            if (!trimmed) {
                return res.status(400).json({ error: 'Display name is required' });
            }
            updates.fullName = trimmed;
        }

        if (bio !== undefined) {
            updates.bio = String(bio).trim().slice(0, 500);
        }

        if (profilePicture !== undefined) {
            updates.profilePicture = profilePicture;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                ...publicUserFields(user),
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Unable to update profile' });
    }
};
