import express from 'express';
import { body, param, query } from 'express-validator';
import GitHubService from '../Services/GitHubService';
import { createRBACMiddleware } from '../middlewares/RBACSystem';
import pool from '../config/postgresql';

const router = express.Router();
const rbac = createRBACMiddleware(pool);

router.get('/installation-url/:accessToken', param('accessToken').not().isEmpty(), rbac.authenticate, GitHubService.GetInstallationURL);

router.get('/installation/callback', query('installationId').not().isEmpty(), query('setupAction').not().isEmpty(), query('state').not().isEmpty(), GitHubService.HandleInstallationCallback);

router.get('/installations/:accessToken', param('accessToken').not().isEmpty(), rbac.authenticate, GitHubService.GetUserInstallations);

router.post('/webhook', GitHubService.HandleWebhook);

router.get('/repository-branches/:accessToken/:repo/:owner/:installationId', param('accessToken').not().isEmpty(), param('repo').not().isEmpty(), param('installationId').not().isEmpty(), param('owner').not().isEmpty(), GitHubService.GetRepositoryBranches);

export = router;
