<?php

namespace Database\Seeders;

use App\Models\Issue;
use App\Models\IssueComment;
use App\Models\IssueLink;
use App\Models\Label;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Release;
use App\Models\ReleaseIssue;
use App\Models\Sprint;
use App\Models\SprintIssue;
use App\Models\TestCase;
use App\Models\TestExecution;
use App\Models\TestRun;
use App\Models\TestRunCase;
use App\Models\TestStep;
use App\Models\TestSuite;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Taskora Demo Organization
        $org = Organization::create([
            'name' => 'Taskora Demo',
            'slug' => 'taskora-demo',
            'description' => 'Demo organization for Taskora Agile Product Management Platform.',
            'timezone' => 'UTC',
            'status' => 'active',
        ]);

        // 2. Create Demo Users
        $password = Hash::make('password');

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@taskora.io',
            'password' => $password,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $pm = User::create([
            'name' => 'Project Manager',
            'email' => 'pm@taskora.io',
            'password' => $password,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $dev = User::create([
            'name' => 'Developer User',
            'email' => 'dev@taskora.io',
            'password' => $password,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $tester = User::create([
            'name' => 'QA Tester',
            'email' => 'tester@taskora.io',
            'password' => $password,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $reporter = User::create([
            'name' => 'Issue Reporter',
            'email' => 'reporter@taskora.io',
            'password' => $password,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 3. Attach Users to Organization with Roles
        $usersWithRoles = [
            [$admin, 'organization_admin'],
            [$pm, 'project_manager'],
            [$dev, 'developer'],
            [$tester, 'tester'],
            [$reporter, 'reporter'],
        ];

        foreach ($usersWithRoles as [$user, $role]) {
            OrganizationMember::create([
                'organization_id' => $org->id,
                'user_id' => $user->id,
                'role' => $role,
                'status' => 'active',
                'joined_at' => now(),
            ]);
        }

        // 4. Create Demo Teams
        $devTeam = Team::create([
            'organization_id' => $org->id,
            'name' => 'Development',
            'slug' => 'development',
            'description' => 'Core product engineering and development team.',
            'created_by' => $admin->id,
        ]);

        $qaTeam = Team::create([
            'organization_id' => $org->id,
            'name' => 'QA & Testing',
            'slug' => 'qa',
            'description' => 'Quality assurance and automated testing team.',
            'created_by' => $admin->id,
        ]);

        TeamMember::create(['team_id' => $devTeam->id, 'user_id' => $dev->id]);
        TeamMember::create(['team_id' => $devTeam->id, 'user_id' => $pm->id]);
        TeamMember::create(['team_id' => $qaTeam->id, 'user_id' => $tester->id]);

        // 5. Create Demo Projects
        $webProject = Project::create([
            'organization_id' => $org->id,
            'name' => 'Website Revamp',
            'key' => 'WEB',
            'slug' => 'website-revamp',
            'description' => 'Redesigning the main corporate portal and web application front-end.',
            'status' => 'active',
            'visibility' => 'organization',
            'start_date' => now()->subDays(14)->toDateString(),
            'target_date' => now()->addMonths(2)->toDateString(),
            'created_by' => $pm->id,
        ]);

        $crmProject = Project::create([
            'organization_id' => $org->id,
            'name' => 'CRM Application',
            'key' => 'CRM',
            'slug' => 'crm-application',
            'description' => 'Enterprise customer relationship management system integration.',
            'status' => 'active',
            'visibility' => 'organization',
            'start_date' => now()->subDays(30)->toDateString(),
            'target_date' => now()->addMonths(4)->toDateString(),
            'created_by' => $admin->id,
        ]);

        $mobProject = Project::create([
            'organization_id' => $org->id,
            'name' => 'Mobile Application',
            'key' => 'MOB',
            'slug' => 'mobile-application',
            'description' => 'Cross-platform iOS and Android mobile app for Taskora platform.',
            'status' => 'planned',
            'visibility' => 'private',
            'start_date' => now()->addDays(7)->toDateString(),
            'target_date' => now()->addMonths(6)->toDateString(),
            'created_by' => $pm->id,
        ]);

        ProjectMember::create(['project_id' => $webProject->id, 'user_id' => $pm->id, 'role' => 'project_manager']);
        ProjectMember::create(['project_id' => $webProject->id, 'user_id' => $dev->id, 'role' => 'developer']);
        ProjectMember::create(['project_id' => $webProject->id, 'user_id' => $tester->id, 'role' => 'tester']);

        ProjectMember::create(['project_id' => $crmProject->id, 'user_id' => $admin->id, 'role' => 'project_manager']);
        ProjectMember::create(['project_id' => $crmProject->id, 'user_id' => $dev->id, 'role' => 'developer']);

        ProjectMember::create(['project_id' => $mobProject->id, 'user_id' => $pm->id, 'role' => 'project_manager']);

        // 6. Create Organization Labels
        $bugLabel = Label::create(['organization_id' => $org->id, 'name' => 'bug', 'color' => '#ef4444', 'created_by' => $admin->id]);
        $frontendLabel = Label::create(['organization_id' => $org->id, 'name' => 'frontend', 'color' => '#3b82f6', 'created_by' => $admin->id]);
        $backendLabel = Label::create(['organization_id' => $org->id, 'name' => 'backend', 'color' => '#10b981', 'created_by' => $admin->id]);
        $urgentLabel = Label::create(['organization_id' => $org->id, 'name' => 'urgent', 'color' => '#f59e0b', 'created_by' => $admin->id]);

        // 7. Seed Demo Issues (Sequential WEB-1 to WEB-5)
        $issue1 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'issue_number' => 1,
            'issue_type' => 'bug',
            'title' => 'Mobile menu drawer not rendering on Safari iOS',
            'description' => 'The mobile navigation drawer fails to open when tapping the hamburger icon on Safari iOS 17.',
            'status' => 'in_progress',
            'priority' => 'high',
            'severity' => 'major',
            'reporter_id' => $tester->id,
            'assignee_id' => $dev->id,
        ]);
        $issue1->labels()->attach([$bugLabel->id, $frontendLabel->id]);
        $issue1->watchers()->attach([$pm->id, $dev->id, $tester->id]);

        $issue2 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'issue_number' => 2,
            'issue_type' => 'feature',
            'title' => 'Implement Dark Mode Glassmorphic Theme',
            'description' => 'Design and integrate Tailwind CSS v4 design tokens for high-contrast dark mode.',
            'status' => 'done',
            'priority' => 'medium',
            'reporter_id' => $pm->id,
            'assignee_id' => $dev->id,
        ]);
        $issue2->labels()->attach([$frontendLabel->id]);

        $issue3 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'issue_number' => 3,
            'issue_type' => 'task',
            'title' => 'Optimize REST API endpoint pagination and eager loading',
            'description' => 'Prevent N+1 queries by eager-loading reporter, assignee, and labels on issue listing.',
            'status' => 'in_progress',
            'priority' => 'urgent',
            'reporter_id' => $admin->id,
            'assignee_id' => $dev->id,
        ]);
        $issue3->labels()->attach([$backendLabel->id, $urgentLabel->id]);

        $issue4 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'issue_number' => 4,
            'issue_type' => 'story',
            'title' => 'As a user I want to link related issues together',
            'description' => 'Allow linking issues with relationships like blocks, blocked_by, duplicates, relates_to.',
            'status' => 'todo',
            'priority' => 'high',
            'reporter_id' => $reporter->id,
            'assignee_id' => $pm->id,
            'backlog_position' => 1,
        ]);

        $issue5 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'issue_number' => 5,
            'issue_type' => 'task',
            'title' => 'Child subtask for menu drawer fix',
            'description' => 'Subtask assigned to test z-index layering on iOS viewport.',
            'status' => 'todo',
            'priority' => 'low',
            'reporter_id' => $dev->id,
            'assignee_id' => $dev->id,
            'parent_id' => $issue1->id,
            'backlog_position' => 2,
        ]);

        // CRM Project Issue
        $crmIssue1 = Issue::create([
            'organization_id' => $org->id,
            'project_id' => $crmProject->id,
            'issue_number' => 1,
            'issue_type' => 'bug',
            'title' => 'Salesforce webhook sync fails on bulk import',
            'description' => 'Bulk contact sync returns 422 Unprocessable Entity during batch ingestion.',
            'status' => 'todo',
            'priority' => 'urgent',
            'severity' => 'critical',
            'reporter_id' => $admin->id,
            'assignee_id' => $dev->id,
        ]);

        // 8. Seed Demo Comments & Links
        IssueComment::create([
            'organization_id' => $org->id,
            'issue_id' => $issue1->id,
            'user_id' => $dev->id,
            'body' => 'Investigating the touch event listener issue on WebKit engine.',
        ]);

        IssueComment::create([
            'organization_id' => $org->id,
            'issue_id' => $issue1->id,
            'user_id' => $tester->id,
            'body' => 'Verified on iPhone 15 Pro, reproducible 100% of the time.',
        ]);

        IssueLink::create([
            'organization_id' => $org->id,
            'issue_id' => $issue3->id,
            'linked_issue_id' => $issue1->id,
            'link_type' => 'relates_to',
            'created_by' => $admin->id,
        ]);

        // 9. Seed Demo Sprints
        $sprint1 = Sprint::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Sprint 1 — Foundation & Authentication',
            'goal' => 'Build authentication, tenant isolation, and basic project shell.',
            'status' => 'completed',
            'start_date' => now()->subDays(28)->toDateString(),
            'end_date' => now()->subDays(14)->toDateString(),
            'created_by' => $pm->id,
            'completed_at' => now()->subDays(14),
        ]);

        $sprint2 = Sprint::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Sprint 2 — Issue Engine & Design System',
            'goal' => 'Implement Issue Engine backend and UI components.',
            'status' => 'active',
            'start_date' => now()->subDays(13)->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'created_by' => $pm->id,
        ]);

        $sprint3 = Sprint::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Sprint 3 — Scrum Board & Agile Workflows',
            'goal' => 'Deliver interactive Kanban board and sprint planning.',
            'status' => 'planned',
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(16)->toDateString(),
            'created_by' => $pm->id,
        ]);

        SprintIssue::create([
            'sprint_id' => $sprint1->id,
            'issue_id' => $issue2->id,
            'added_by' => $pm->id,
            'position' => 1,
            'added_at' => now()->subDays(28),
        ]);

        SprintIssue::create([
            'sprint_id' => $sprint2->id,
            'issue_id' => $issue1->id,
            'added_by' => $pm->id,
            'position' => 1,
            'added_at' => now()->subDays(13),
        ]);

        SprintIssue::create([
            'sprint_id' => $sprint2->id,
            'issue_id' => $issue3->id,
            'added_by' => $pm->id,
            'position' => 2,
            'added_at' => now()->subDays(13),
        ]);

        // 10. Seed Demo QA Data (Test Suites, Cases, Steps, Runs, Executions)
        $smokeSuite = TestSuite::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Smoke Testing',
            'description' => 'Critical path verification tests for web application build verification.',
            'status' => 'active',
            'created_by' => $tester->id,
        ]);

        $regressionSuite = TestSuite::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Regression Testing',
            'description' => 'Comprehensive regression suite for core feature releases.',
            'status' => 'active',
            'created_by' => $tester->id,
        ]);

        $authSuite = TestSuite::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Authentication & Access Control',
            'description' => 'Sanctum token auth, rate limiters, and policy authorization tests.',
            'status' => 'active',
            'created_by' => $tester->id,
        ]);

        // Test Cases (TC-WEB-1, TC-WEB-2, TC-WEB-3)
        $tc1 = TestCase::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'suite_id' => $smokeSuite->id,
            'case_number' => 1,
            'title' => 'Verify mobile menu drawer functionality on iOS devices',
            'description' => 'Test that tapping the hamburger icon opens drawer navigation cleanly on Safari WebKit.',
            'preconditions' => 'User is logged in on iOS mobile device viewport.',
            'test_type' => 'smoke',
            'priority' => 'critical',
            'status' => 'ready',
            'created_by' => $tester->id,
        ]);

        TestStep::create(['test_case_id' => $tc1->id, 'step_number' => 1, 'action' => 'Open mobile web browser and navigate to dashboard', 'expected_result' => 'Dashboard renders responsive header']);
        TestStep::create(['test_case_id' => $tc1->id, 'step_number' => 2, 'action' => 'Tap on hamburger icon in header', 'expected_result' => 'Mobile menu drawer slides smoothly from left side']);
        TestStep::create(['test_case_id' => $tc1->id, 'step_number' => 3, 'action' => 'Tap on Projects link in drawer', 'expected_result' => 'Navigates to Projects page']);

        $tc2 = TestCase::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'suite_id' => $regressionSuite->id,
            'case_number' => 2,
            'title' => 'Verify Dark Mode Glassmorphic styling tokens',
            'description' => 'Check high contrast colors and backdrop blur on slate dark theme.',
            'preconditions' => 'App rendered in dark mode.',
            'test_type' => 'usability',
            'priority' => 'medium',
            'status' => 'ready',
            'created_by' => $tester->id,
        ]);

        TestStep::create(['test_case_id' => $tc2->id, 'step_number' => 1, 'action' => 'Inspect dark mode container background', 'expected_result' => 'Background matches slate-950 hex code']);

        $tc3 = TestCase::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'suite_id' => $authSuite->id,
            'case_number' => 3,
            'title' => 'Verify login rate limiter throttles excessive attempts',
            'description' => 'Ensure HTTP 429 Too Many Requests returned after 5 failed login attempts.',
            'preconditions' => 'Unauthenticated user at /api/v1/auth/login.',
            'test_type' => 'security',
            'priority' => 'high',
            'status' => 'ready',
            'created_by' => $tester->id,
        ]);

        TestStep::create(['test_case_id' => $tc3->id, 'step_number' => 1, 'action' => 'Send 6 consecutive POST requests with bad credentials', 'expected_result' => '6th request returns 429 Too Many Requests']);

        // Link Test Cases to Issues
        DB::table('test_case_issues')->insert([
            'test_case_id' => $tc1->id,
            'issue_id' => $issue1->id,
            'created_by' => $tester->id,
            'created_at' => now(),
        ]);

        DB::table('test_case_issues')->insert([
            'test_case_id' => $tc2->id,
            'issue_id' => $issue2->id,
            'created_by' => $tester->id,
            'created_at' => now(),
        ]);

        // Test Runs
        $runActive = TestRun::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Sprint 2 QA Execution Run',
            'description' => 'Active QA execution for Sprint 2 build validation.',
            'status' => 'active',
            'environment' => 'staging',
            'started_at' => now()->subDays(2),
            'created_by' => $tester->id,
        ]);

        $runPlanned = TestRun::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Sprint 3 QA Regression Run',
            'description' => 'Planned full regression run for upcoming Sprint 3 release.',
            'status' => 'planned',
            'environment' => 'production-staging',
            'created_by' => $tester->id,
        ]);

        // Add Cases to Active Run
        $trc1 = TestRunCase::create(['test_run_id' => $runActive->id, 'test_case_id' => $tc1->id, 'position' => 1, 'created_by' => $tester->id]);
        $trc2 = TestRunCase::create(['test_run_id' => $runActive->id, 'test_case_id' => $tc2->id, 'position' => 2, 'created_by' => $tester->id]);
        $trc3 = TestRunCase::create(['test_run_id' => $runActive->id, 'test_case_id' => $tc3->id, 'position' => 3, 'created_by' => $tester->id]);

        // Executions
        TestExecution::create([
            'organization_id' => $org->id,
            'test_run_id' => $runActive->id,
            'test_case_id' => $tc1->id,
            'test_run_case_id' => $trc1->id,
            'status' => 'failed',
            'executed_by' => $tester->id,
            'executed_at' => now()->subHours(5),
            'actual_result' => 'Drawer fails to expand on Safari Mobile WebKit.',
            'notes' => 'Linked to issue WEB-1 for developer fix.',
        ]);

        TestExecution::create([
            'organization_id' => $org->id,
            'test_run_id' => $runActive->id,
            'test_case_id' => $tc2->id,
            'test_run_case_id' => $trc2->id,
            'status' => 'passed',
            'executed_by' => $tester->id,
            'executed_at' => now()->subHours(4),
            'actual_result' => 'Theme renders high contrast dark elements perfectly.',
        ]);

        TestExecution::create([
            'organization_id' => $org->id,
            'test_run_id' => $runActive->id,
            'test_case_id' => $tc3->id,
            'test_run_case_id' => $trc3->id,
            'status' => 'not_run',
        ]);

        // 11. Seed Demo Releases
        $relV100 = Release::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Website MVP Release',
            'version' => 'WEB v1.0.0',
            'description' => 'Initial MVP launch of corporate website and authentication.',
            'status' => 'released',
            'start_date' => now()->subDays(30)->toDateString(),
            'release_date' => now()->subDays(14)->toDateString(),
            'released_at' => now()->subDays(14),
            'created_by' => $pm->id,
            'release_manager_id' => $pm->id,
        ]);

        $relV110 = Release::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Content & UX Update',
            'version' => 'WEB v1.1.0',
            'description' => 'Dark mode design system integration and mobile bug fixes.',
            'status' => 'in_progress',
            'start_date' => now()->subDays(13)->toDateString(),
            'release_date' => now()->addDays(7)->toDateString(),
            'created_by' => $pm->id,
            'release_manager_id' => $dev->id,
        ]);

        $relV200 = Release::create([
            'organization_id' => $org->id,
            'project_id' => $webProject->id,
            'name' => 'Production Redesign',
            'version' => 'WEB v2.0.0',
            'description' => 'Full redesign and automated release deployment pipeline.',
            'status' => 'planned',
            'start_date' => now()->addDays(14)->toDateString(),
            'release_date' => now()->addMonths(2)->toDateString(),
            'created_by' => $pm->id,
            'release_manager_id' => $pm->id,
        ]);

        Release::create([
            'organization_id' => $org->id,
            'project_id' => $crmProject->id,
            'name' => 'CRM Initial Release',
            'version' => 'CRM v1.0.0',
            'description' => 'Initial CRM integration release.',
            'status' => 'planned',
            'start_date' => now()->addDays(10)->toDateString(),
            'release_date' => now()->addMonths(1)->toDateString(),
            'created_by' => $admin->id,
            'release_manager_id' => $admin->id,
        ]);

        Release::create([
            'organization_id' => $org->id,
            'project_id' => $mobProject->id,
            'name' => 'Mobile App Beta Launch',
            'version' => 'MOB v1.0.0',
            'description' => 'iOS and Android beta release.',
            'status' => 'planned',
            'start_date' => now()->addDays(20)->toDateString(),
            'release_date' => now()->addMonths(3)->toDateString(),
            'created_by' => $pm->id,
            'release_manager_id' => $pm->id,
        ]);

        ReleaseIssue::create([
            'release_id' => $relV100->id,
            'issue_id' => $issue2->id,
            'added_by' => $pm->id,
            'created_at' => now()->subDays(20),
        ]);

        ReleaseIssue::create([
            'release_id' => $relV110->id,
            'issue_id' => $issue1->id,
            'added_by' => $pm->id,
            'created_at' => now()->subDays(10),
        ]);

        ReleaseIssue::create([
            'release_id' => $relV110->id,
            'issue_id' => $issue3->id,
            'added_by' => $pm->id,
            'created_at' => now()->subDays(10),
        ]);

        // 12. Log Activity
        ActivityLogger::log($org->id, $admin->id, 'organization.created', 'Created organization Taskora Demo', $org);
        ActivityLogger::log($org->id, $tester->id, 'issue.created', "Created issue {$issue1->key}: {$issue1->title}", $issue1);
        ActivityLogger::log($org->id, $pm->id, 'issue.created', "Created issue {$issue2->key}: {$issue2->title}", $issue2);
        ActivityLogger::log($org->id, $pm->id, 'sprint.created', "Created sprint '{$sprint2->name}'", $sprint2);
        ActivityLogger::log($org->id, $tester->id, 'qa.test_case_created', "Created test case {$tc1->key}: {$tc1->title}", $tc1);
        ActivityLogger::log($org->id, $tester->id, 'qa.test_run_started', "Started test run '{$runActive->name}'", $runActive);
        ActivityLogger::log($org->id, $pm->id, 'release.created', "Created release '{$relV110->name}' ({$relV110->version})", $relV110);
    }
}
