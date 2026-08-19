import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id, skills: [], education: [], experience: [], projects: [] });
    }
    const userDoc = await User.findById(req.user._id);
    return res.status(200).json({ success: true, data: { user: userDoc || req.user, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, targetDomain, dreamCompany, education, skills, projects, experience } = req.body;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (targetDomain !== undefined) userUpdates.targetDomain = targetDomain;
    if (dreamCompany !== undefined) userUpdates.dreamCompany = dreamCompany;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { bio, education, skills, projects, experience },
      { new: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user._id);

    return res.status(200).json({ success: true, data: { user: updatedUser, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};
