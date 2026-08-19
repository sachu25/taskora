<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BacklogController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\IssueCommentController;
use App\Http\Controllers\Api\V1\IssueController;
use App\Http\Controllers\Api\V1\IssueLinkController;
use App\Http\Controllers\Api\V1\IssueWatcherController;
use App\Http\Controllers\Api\V1\LabelController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\OrganizationMemberController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectMemberController;
use App\Http\Controllers\Api\V1\ReleaseController;
use App\Http\Controllers\Api\V1\ReleaseIssueController;
use App\Http\Controllers\Api\V1\SprintController;
use App\Http\Controllers\Api\V1\SprintIssueController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\TeamMemberController;
use App\Http\Controllers\Api\V1\TestCaseController;
use App\Http\Controllers\Api\V1\TestCaseIssueController;
use App\Http\Controllers\Api\V1\TestExecutionController;
use App\Http\Controllers\Api\V1\TestRunCaseController;
use App\Http\Controllers\Api\V1\TestRunController;
use App\Http\Controllers\Api\V1\TestStepController;
use App\Http\Controllers\Api\V1\TestSuiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth public routes with strict rate limiters
    Route::middleware('throttle:auth-register')->post('auth/register', [AuthController::class, 'register']);
    Route::middleware('throttle:auth-login')->post('auth/login', [AuthController::class, 'login']);
    Route::middleware('throttle:auth-password')->post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::middleware('throttle:auth-password')->post('auth/reset-password', [AuthController::class, 'resetPassword']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Organizations
        Route::get('organizations', [OrganizationController::class, 'index']);
        Route::post('organizations', [OrganizationController::class, 'store']);
        Route::get('organizations/{organization}', [OrganizationController::class, 'show']);
        Route::patch('organizations/{organization}', [OrganizationController::class, 'update']);

        // Organization Dashboard, Members & Labels
        Route::get('organizations/{organization}/dashboard', [DashboardController::class, 'show']);
        Route::get('organizations/{organization}/members', [OrganizationMemberController::class, 'index']);
        Route::post('organizations/{organization}/members', [OrganizationMemberController::class, 'store']);
        Route::delete('organizations/{organization}/members/{user}', [OrganizationMemberController::class, 'destroy']);

        Route::get('organizations/{organization}/labels', [LabelController::class, 'index']);
        Route::post('organizations/{organization}/labels', [LabelController::class, 'store']);
        Route::patch('labels/{label}', [LabelController::class, 'update']);
        Route::delete('labels/{label}', [LabelController::class, 'destroy']);

        // Teams
        Route::get('organizations/{organization}/teams', [TeamController::class, 'index']);
        Route::post('organizations/{organization}/teams', [TeamController::class, 'store']);
        Route::get('teams/{team}', [TeamController::class, 'show']);
        Route::patch('teams/{team}', [TeamController::class, 'update']);
        Route::delete('teams/{team}', [TeamController::class, 'destroy']);

        // Team Members
        Route::get('teams/{team}/members', [TeamMemberController::class, 'index']);
        Route::post('teams/{team}/members', [TeamMemberController::class, 'store']);
        Route::delete('teams/{team}/members/{user}', [TeamMemberController::class, 'destroy']);

        // Projects
        Route::get('organizations/{organization}/projects', [ProjectController::class, 'index']);
        Route::post('organizations/{organization}/projects', [ProjectController::class, 'store']);
        Route::get('projects/{project}', [ProjectController::class, 'show']);
        Route::patch('projects/{project}', [ProjectController::class, 'update']);
        Route::delete('projects/{project}', [ProjectController::class, 'destroy']);

        // Project Members & Issues
        Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
        Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
        Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

        Route::get('projects/{project}/issues', [IssueController::class, 'index']);
        Route::post('projects/{project}/issues', [IssueController::class, 'store']);

        // Project Sprints & Backlog
        Route::get('projects/{project}/sprints', [SprintController::class, 'index']);
        Route::post('projects/{project}/sprints', [SprintController::class, 'store']);

        Route::get('projects/{project}/backlog', [BacklogController::class, 'index']);
        Route::patch('projects/{project}/backlog/{issue}/position', [BacklogController::class, 'reorder']);

        // Sprints Management & Lifecycle
        Route::get('sprints/{sprint}', [SprintController::class, 'show']);
        Route::patch('sprints/{sprint}', [SprintController::class, 'update']);
        Route::delete('sprints/{sprint}', [SprintController::class, 'destroy']);
        Route::post('sprints/{sprint}/restore', [SprintController::class, 'restore']);

        Route::post('sprints/{sprint}/start', [SprintController::class, 'start']);
        Route::post('sprints/{sprint}/complete', [SprintController::class, 'complete']);
        Route::post('sprints/{sprint}/cancel', [SprintController::class, 'cancel']);

        // Sprint Issues & Reordering
        Route::get('sprints/{sprint}/issues', [SprintIssueController::class, 'index']);
        Route::post('sprints/{sprint}/issues', [SprintIssueController::class, 'store']);
        Route::delete('sprints/{sprint}/issues/{issue}', [SprintIssueController::class, 'destroy']);
        Route::patch('sprints/{sprint}/issues/{issue}/position', [SprintIssueController::class, 'reorder']);

        // Issues Management
        Route::get('issues/{issue}', [IssueController::class, 'show']);
        Route::patch('issues/{issue}', [IssueController::class, 'update']);
        Route::delete('issues/{issue}', [IssueController::class, 'destroy']);
        Route::post('issues/{issue}/restore', [IssueController::class, 'restore']);

        // Issue Comments
        Route::get('issues/{issue}/comments', [IssueCommentController::class, 'index']);
        Route::post('issues/{issue}/comments', [IssueCommentController::class, 'store']);
        Route::patch('comments/{comment}', [IssueCommentController::class, 'update']);
        Route::delete('comments/{comment}', [IssueCommentController::class, 'destroy']);

        // Issue Labels
        Route::post('issues/{issue}/labels/{label}', [LabelController::class, 'attach']);
        Route::delete('issues/{issue}/labels/{label}', [LabelController::class, 'detach']);

        // Issue Watchers
        Route::get('issues/{issue}/watchers', [IssueWatcherController::class, 'index']);
        Route::post('issues/{issue}/watchers', [IssueWatcherController::class, 'store']);
        Route::delete('issues/{issue}/watchers/{user}', [IssueWatcherController::class, 'destroy']);

        // Issue Links
        Route::get('issues/{issue}/links', [IssueLinkController::class, 'index']);
        Route::post('issues/{issue}/links', [IssueLinkController::class, 'store']);
        Route::delete('issue-links/{link}', [IssueLinkController::class, 'destroy']);

        // Milestone 05 — QA / Test Management Routes
        // Test Suites
        Route::get('projects/{project}/test-suites', [TestSuiteController::class, 'index']);
        Route::post('projects/{project}/test-suites', [TestSuiteController::class, 'store']);
        Route::get('test-suites/{suite}', [TestSuiteController::class, 'show']);
        Route::patch('test-suites/{suite}', [TestSuiteController::class, 'update']);
        Route::delete('test-suites/{suite}', [TestSuiteController::class, 'destroy']);
        Route::post('test-suites/{suite}/restore', [TestSuiteController::class, 'restore']);

        // Test Cases
        Route::get('projects/{project}/test-cases', [TestCaseController::class, 'index']);
        Route::post('projects/{project}/test-cases', [TestCaseController::class, 'store']);
        Route::get('test-cases/{case}', [TestCaseController::class, 'show']);
        Route::patch('test-cases/{case}', [TestCaseController::class, 'update']);
        Route::delete('test-cases/{case}', [TestCaseController::class, 'destroy']);
        Route::post('test-cases/{case}/restore', [TestCaseController::class, 'restore']);

        // Test Steps
        Route::get('test-cases/{case}/steps', [TestStepController::class, 'index']);
        Route::post('test-cases/{case}/steps', [TestStepController::class, 'store']);
        Route::patch('test-cases/{case}/steps/{step}', [TestStepController::class, 'update']);
        Route::delete('test-cases/{case}/steps/{step}', [TestStepController::class, 'destroy']);
        Route::patch('test-cases/{case}/steps/{step}/position', [TestStepController::class, 'reorder']);

        // Issue Relationships
        Route::get('test-cases/{case}/issues', [TestCaseIssueController::class, 'index']);
        Route::post('test-cases/{case}/issues', [TestCaseIssueController::class, 'store']);
        Route::delete('test-cases/{case}/issues/{issue}', [TestCaseIssueController::class, 'destroy']);

        // Test Runs
        Route::get('projects/{project}/test-runs', [TestRunController::class, 'index']);
        Route::post('projects/{project}/test-runs', [TestRunController::class, 'store']);
        Route::get('test-runs/{run}', [TestRunController::class, 'show']);
        Route::patch('test-runs/{run}', [TestRunController::class, 'update']);
        Route::delete('test-runs/{run}', [TestRunController::class, 'destroy']);
        Route::post('test-runs/{run}/restore', [TestRunController::class, 'restore']);

        Route::post('test-runs/{run}/start', [TestRunController::class, 'start']);
        Route::post('test-runs/{run}/complete', [TestRunController::class, 'complete']);
        Route::post('test-runs/{run}/cancel', [TestRunController::class, 'cancel']);

        // Test Run Cases
        Route::get('test-runs/{run}/cases', [TestRunCaseController::class, 'index']);
        Route::post('test-runs/{run}/cases', [TestRunCaseController::class, 'store']);
        Route::delete('test-runs/{run}/cases/{case}', [TestRunCaseController::class, 'destroy']);
        Route::patch('test-runs/{run}/cases/{case}/position', [TestRunCaseController::class, 'reorder']);

        // Test Execution
        Route::get('test-runs/{run}/executions', [TestExecutionController::class, 'index']);
        Route::post('test-runs/{run}/cases/{case}/execute', [TestExecutionController::class, 'execute']);
        Route::post('test-runs/{run}/cases/{case}/reset', [TestExecutionController::class, 'reset']);

        // Milestone 06 — Release Management Routes
        Route::get('projects/{project}/releases', [ReleaseController::class, 'index']);
        Route::post('projects/{project}/releases', [ReleaseController::class, 'store']);
        Route::get('releases/{release}', [ReleaseController::class, 'show']);
        Route::patch('releases/{release}', [ReleaseController::class, 'update']);
        Route::delete('releases/{release}', [ReleaseController::class, 'destroy']);
        Route::post('releases/{release}/restore', [ReleaseController::class, 'restore']);

        Route::post('releases/{release}/start', [ReleaseController::class, 'start']);
        Route::post('releases/{release}/complete', [ReleaseController::class, 'complete']);
        Route::post('releases/{release}/cancel', [ReleaseController::class, 'cancel']);

        Route::get('releases/{release}/issues', [ReleaseIssueController::class, 'index']);
        Route::post('releases/{release}/issues', [ReleaseIssueController::class, 'store']);
        Route::delete('releases/{release}/issues/{issue}', [ReleaseIssueController::class, 'destroy']);

        Route::post('releases/{release}/manager', [ReleaseController::class, 'assignManager']);
        Route::delete('releases/{release}/manager', [ReleaseController::class, 'removeManager']);

        // Milestone 07 — Notifications & Activity Management Routes
        Route::get('notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [\App\Http\Controllers\Api\V1\NotificationController::class, 'unreadCount']);
        Route::post('notifications/read-all', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllAsRead']);
        Route::delete('notifications/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'destroyRead']);
        Route::get('notifications/{notification}', [\App\Http\Controllers\Api\V1\NotificationController::class, 'show']);
        Route::post('notifications/{notification}/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAsRead']);
        Route::post('notifications/{notification}/unread', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAsUnread']);
        Route::delete('notifications/{notification}', [\App\Http\Controllers\Api\V1\NotificationController::class, 'destroy']);

        Route::get('notification-preferences', [\App\Http\Controllers\Api\V1\NotificationPreferenceController::class, 'index']);
        Route::patch('notification-preferences/{preferenceKey}', [\App\Http\Controllers\Api\V1\NotificationPreferenceController::class, 'update']);
        Route::post('notification-preferences/reset', [\App\Http\Controllers\Api\V1\NotificationPreferenceController::class, 'reset']);

        Route::get('activity', [\App\Http\Controllers\Api\V1\ActivityController::class, 'index']);
        Route::get('projects/{project}/activity', [\App\Http\Controllers\Api\V1\ActivityController::class, 'project']);
        Route::get('issues/{issue}/activity', [\App\Http\Controllers\Api\V1\ActivityController::class, 'issue']);
        Route::get('sprints/{sprint}/activity', [\App\Http\Controllers\Api\V1\ActivityController::class, 'sprint']);
        Route::get('releases/{release}/activity', [\App\Http\Controllers\Api\V1\ActivityController::class, 'release']);
    });
});
