const Group = require('../models/Group');
const { logger } = require('../utils/logger');

class GroupController {
    constructor(supabase) {
        this.supabase = supabase;
        this.groupModel = new Group(supabase);
    }

    async getAllGroups(req, res) {
        const userId = req.user.id;
        try {
            const groups = await this.groupModel.findByUser(userId);
            logger.info('Retrieved groups for user', { userId, groupCount: groups.length, groupIds: groups.map(g => g.id) });
            res.json(groups);
        } catch (error) {
            logger.error('Failed to get groups for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch groups' });
        }
    }

    async getGroupById(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;
        
        logger.info('Attempting to get group by ID', { userId, groupId });
        
        try {
            const group = await this.groupModel.getById(groupId, userId);
            if (!group) {
                logger.warn('Group not found or user not a member', { userId, groupId });
                return res.status(404).json({ error: 'Group not found or you are not a member.' });
            }
            
            logger.info('Successfully retrieved group', { userId, groupId, memberCount: group.group_members?.length || 0 });
            res.json(group);
        } catch (error) {
            logger.error('Failed to get group by ID', { userId, groupId, error: error.message, stack: error.stack });
            res.status(500).json({ error: 'Failed to fetch group' });
        }
    }

    async createGroup(req, res) {
        const userId = req.user.id;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        try {
            const newGroup = await this.groupModel.create({ name, created_by: userId });
            res.status(201).json(newGroup);
        } catch (error) {
            logger.error('Failed to create group', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create group' });
        }
    }

    async updateGroup(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;
        const { name } = req.body;

        try {
            const updatedGroup = await this.groupModel.update(groupId, userId, { name });
            if (!updatedGroup) {
                return res.status(404).json({ error: 'Group not found or you do not have permission to update it.' });
            }
            res.json(updatedGroup);
        } catch (error) {
            logger.error('Failed to update group', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to update group' });
        }
    }

    async deleteGroup(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;

        try {
            const deletedGroup = await this.groupModel.delete(groupId, userId);
            if (!deletedGroup) {
                return res.status(404).json({ error: 'Group not found or you do not have permission to delete it.' });
            }
            res.json({ message: 'Group deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete group', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to delete group' });
        }
    }

    async addUserToGroup(req, res) {
        const groupId = req.params.id;
        const { userId: userToAdd } = req.body;
        const requesterId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, requesterId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add users.' });
            }

            const member = await this.groupModel.addMember(groupId, userToAdd);
            res.status(201).json(member);
        } catch (error) {
            logger.error('Failed to add user to group', { requesterId, groupId, userToAdd, error: error.message });
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'User is already a member of this group.' });
            }
            res.status(500).json({ error: 'Failed to add user to group' });
        }
    }

    async addGroupMember(req, res) {
        const groupId = req.params.id;
        const { name } = req.body;
        const userId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add members.' });
            }

            // For now, we'll create a simple member entry
            // In a more complex system, you might want to create user accounts or send invitations
            const member = await this.groupModel.addMember(groupId, name);
            res.status(201).json(member);
        } catch (error) {
            logger.error('Failed to add group member', { userId, groupId, name, error: error.message });
            res.status(500).json({ error: 'Failed to add group member' });
        }
    }

    async removeGroupMember(req, res) {
        const groupId = req.params.id;
        const { userId: userToRemove } = req.params;
        const requesterId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, requesterId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to remove members.' });
            }

            await this.groupModel.removeMember(groupId, userToRemove);
            res.json({ message: 'Member removed successfully' });
        } catch (error) {
            logger.error('Failed to remove group member', { requesterId, groupId, userToRemove, error: error.message });
            res.status(500).json({ error: 'Failed to remove group member' });
        }
    }

    async sendGroupInvitation(req, res) {
        const groupId = req.params.id;
        const { email } = req.body;
        const userId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to send invitations.' });
            }

            // TODO: Implement invitation logic - for now return success
            // In a real implementation, you would:
            // 1. Create an invitation record
            // 2. Send an email to the user
            // 3. Handle the invitation acceptance flow
            
            res.json({ message: 'Invitation sent successfully', email });
        } catch (error) {
            logger.error('Failed to send group invitation', { userId, groupId, email, error: error.message });
            res.status(500).json({ error: 'Failed to send group invitation' });
        }
    }

    async addGroupExpense(req, res) {
        const groupId = req.params.id;
        const userId = req.user.id;
        const expenseData = req.body;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add expenses.' });
            }

            const expense = await this.groupModel.addExpense(groupId, userId, expenseData);
            res.status(201).json(expense);
        } catch (error) {
            logger.error('Failed to add group expense', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to add group expense' });
        }
    }

    async updateGroupExpense(req, res) {
        const { expenseId } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        try {
            const expense = await this.groupModel.updateExpense(expenseId, updates);
            res.json(expense);
        } catch (error) {
            logger.error('Failed to update group expense', { userId, expenseId, error: error.message });
            res.status(500).json({ error: 'Failed to update group expense' });
        }
    }

    async deleteGroupExpense(req, res) {
        const { expenseId } = req.params;
        const userId = req.user.id;

        try {
            await this.groupModel.deleteExpense(expenseId);
            res.json({ message: 'Expense deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete group expense', { userId, expenseId, error: error.message });
            res.status(500).json({ error: 'Failed to delete group expense' });
        }
    }

    async settleExpenseShare(req, res) {
        const { shareId } = req.params;
        const userId = req.user.id;

        try {
            const share = await this.groupModel.settleShare(shareId, userId);
            res.json(share);
        } catch (error) {
            logger.error('Failed to settle expense share', { userId, shareId, error: error.message });
            res.status(500).json({ error: 'Failed to settle expense share' });
        }
    }
}

module.exports = GroupController;
