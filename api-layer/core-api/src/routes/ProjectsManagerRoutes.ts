import express from 'express';
import { body, param } from 'express-validator';

import ProjectsServices from '../Services/ProjectServices';
import { createRBACMiddleware } from '../middlewares/RBACSystem';
import pool from '../config/postgresql';
import { PermissionAction, PermissionResource } from '../middlewares/RBACTypes';

const router = express.Router();

const rbac = createRBACMiddleware(pool);

router.post(
    '/create-project',
    body('accessToken').not().isEmpty().withMessage('Access token is required'),
    body('name').not().isEmpty().withMessage('Project name is required'),
    body('teamId').not().isEmpty().withMessage('Team ID is required'),
    body('gitRepoUrl').not().isEmpty().withMessage('Git repository URL is required'),
    body('productionBranch'),
    body('stagingBranch'),
    body('developmentBranch'),
    body('createDeploymentNow').not().isEmpty().withMessage('Create deployment now is required'),
    body('autoDeployProduction').not().isEmpty().withMessage('Auto deploy production is required'),
    body('autoDeployStaging').not().isEmpty().withMessage('Auto deploy staging is required'),
    body('autoDeployDevelopment').not().isEmpty().withMessage('Auto deploy development is required'),
    body('accessToken').not().isEmpty(),
    rbac.authenticate,
    rbac.loadCompanyEmployee,
    rbac.requirePermission(PermissionResource.PROJECT, PermissionAction.CREATE),
    ProjectsServices.CreateProject,
);

router.get('/get-projects/:accessToken', param('accessToken').not().isEmpty(), rbac.authenticate, rbac.loadCompanyEmployee, rbac.requirePermission(PermissionResource.PROJECT, PermissionAction.READ), ProjectsServices.GetProjects);
router.put('/update-project', body('accessToken').not().isEmpty(), body('projectId').not().isEmpty(), body('projectName').not().isEmpty(), ProjectsServices.RegisterUserWithGoogle);

router.delete('/delete-project', body('accessToken').not().isEmpty(), body('projectId').not().isEmpty(), ProjectsServices.RegisterUserWithGoogle);

router.post('/trigger-build', body('projectId').not().isEmpty(), ProjectsServices.TriggerBuild);

export = router;
