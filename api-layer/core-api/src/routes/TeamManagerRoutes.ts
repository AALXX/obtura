import express from 'express';
import { body, param } from 'express-validator';

import TeamServices from '../Services/TeamServices';

const router = express.Router();

router.post(
    '/create-team',
    body('accessToken').notEmpty().withMessage('Access token is required').isString().withMessage('Access token must be a string'),
    body('teamName').notEmpty().withMessage('Team name is required').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Team name must be between 2 and 100 characters'),
    body('teamDescription').optional().isString().trim().isLength({ max: 500 }).withMessage('Team description must not exceed 500 characters'),
    TeamServices.CreateTeam,
);

router.get('/get-teams/:accessToken', param('accessToken').notEmpty().withMessage('Access token is required').isString(), TeamServices.GetTeams);

router.get(
    '/get-team-data/:accessToken/:teamId',
    param('accessToken').notEmpty().withMessage('Access token is required').isString(),
    param('teamId').notEmpty().withMessage('Team ID is required').isString(),
    TeamServices.GetTeamData,
);

router.post(
    '/accept-invitation',
    body('accessToken').notEmpty().withMessage('Access token is required').isString(),
    body('teamId').notEmpty().withMessage('Team ID is required').isString(),
    TeamServices.AcceptInvitation,
);

router.put(
    '/update-team',
    body('accessToken').notEmpty().withMessage('Access token is required').isString(),
    body('teamId').notEmpty().withMessage('Team ID is required').isString(),
    body('teamName').notEmpty().withMessage('Team name is required').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Team name must be between 2 and 100 characters'),
    body('teamDescription').optional().isString().trim().isLength({ max: 500 }).withMessage('Team description must not exceed 500 characters'),
    TeamServices.UpdateTeam,
);

router.delete('/delete-team', body('accessToken').notEmpty().withMessage('Access token is required').isString(), body('teamId').notEmpty().withMessage('Team ID is required').isString(), TeamServices.DeleteTeam);

router.post(
    '/invite-members',
    body('accessToken').notEmpty().withMessage('Access token is required').isString(),
    body('teamId').notEmpty().withMessage('Team ID is required').isString(),
    body('invitations')
        .notEmpty()
        .withMessage('Invitations array is required')
        .isArray({ min: 1 })
        .withMessage('Invitations must be a non-empty array')
        .custom((invitations) => {
            for (const invitation of invitations) {
                if (!invitation.email || typeof invitation.email !== 'string') {
                    throw new Error('Each invitation must have a valid email');
                }
                if (!invitation.role || !['owner', 'member'].includes(invitation.role)) {
                    throw new Error('Each invitation must have a valid role (owner or member)');
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(invitation.email)) {
                    throw new Error(`Invalid email format: ${invitation.email}`);
                }
            }
            return true;
        }),
    TeamServices.InviteUser,
);

router.post(
    '/promote-member',
    body('accessToken').notEmpty().withMessage('Access token is required').isString(),
    body('teamId').notEmpty().withMessage('Team ID is required').isString(),
    body('userId').notEmpty().withMessage('User ID is required').isString(),
    body('role').notEmpty().withMessage('Role is required').isIn(['owner', 'member']).withMessage('Role must be "owner" or "member"'),
    TeamServices.PromoteMember,
);

router.delete(
    '/remove-member',
    body('accessToken').notEmpty().withMessage('Access token is required').isString(),
    body('teamId').notEmpty().withMessage('Team ID is required').isString(),
    body('userId').notEmpty().withMessage('User ID is required').isString(),
    TeamServices.RemoveMember,
);

export = router;
