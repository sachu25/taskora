<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SprintTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $organization;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->organization = Organization::create([
            'name' => 'Sprint Test Org',
            'slug' => 'sprint-test-org',
        ]);

        OrganizationMember::create([
            'organization_id' => $this->organization->id,
            'user_id' => $this->user->id,
            'role' => 'project_manager',
        ]);

        $this->project = Project::create([
            'organization_id' => $this->organization->id,
            'name' => 'Sprint Test Project',
            'key' => 'STP',
            'slug' => 'sprint-test-project',
            'created_by' => $this->user->id,
        ]);

        ProjectMember::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'role' => 'project_manager',
        ]);
    }

    public function test_user_can_create_sprint(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/projects/{$this->project->id}/sprints", [
                'name' => 'Sprint 1',
                'goal' => 'Sprint 1 Goal',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(14)->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Sprint 1')
            ->assertJsonPath('data.status', 'planned');

        $this->assertDatabaseHas('sprints', [
            'name' => 'Sprint 1',
            'project_id' => $this->project->id,
            'status' => 'planned',
        ]);
    }

    public function test_can_list_and_filter_sprints(): void
    {
        Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint Alpha',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint Beta',
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays(14),
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/projects/{$this->project->id}/sprints?status=active");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.name', 'Sprint Beta');
    }

    public function test_can_start_sprint_and_enforce_one_active_sprint_rule(): void
    {
        $sprint1 = Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint 1',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        $sprint2 = Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint 2',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        // Start Sprint 1
        $startResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint1->id}/start", [
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(14)->toDateString(),
            ]);

        $startResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'active');

        // Attempting to start Sprint 2 while Sprint 1 is active must fail (422)
        $failResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint2->id}/start", [
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(14)->toDateString(),
            ]);

        $failResponse->assertStatus(422);
    }

    public function test_invalid_sprint_lifecycle_transitions_are_rejected(): void
    {
        $sprint = Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint Planned',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        // Cannot complete a planned sprint directly
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/complete");

        $response->assertStatus(422);

        // Start sprint first
        $sprint->update(['status' => 'active', 'start_date' => now(), 'end_date' => now()->addDays(14)]);

        // Complete sprint
        $completeResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/complete");
        $completeResponse->assertStatus(200)->assertJsonPath('data.status', 'completed');

        // Cannot start a completed sprint
        $restartResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/start", [
                'end_date' => now()->addDays(14)->toDateString(),
            ]);
        $restartResponse->assertStatus(422);
    }

    public function test_can_add_remove_and_reorder_sprint_issues(): void
    {
        $sprint = Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Sprint 1',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        $issue1 = Issue::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Issue 1',
            'reporter_id' => $this->user->id,
        ]);

        $issue2 = Issue::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'issue_number' => 2,
            'title' => 'Issue 2',
            'reporter_id' => $this->user->id,
        ]);

        // Add Issue 1
        $addResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/issues", [
                'issue_id' => $issue1->id,
            ]);

        $addResponse->assertStatus(201)
            ->assertJsonPath('data.issue.id', $issue1->id);

        // Add Issue 2
        $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/issues", [
                'issue_id' => $issue2->id,
            ]);

        // Duplicate addition fails
        $dupResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/issues", [
                'issue_id' => $issue1->id,
            ]);
        $dupResponse->assertStatus(422);

        // Reorder Issue 1
        $reorderResponse = $this->actingAs($this->user)
            ->patchJson("/api/v1/sprints/{$sprint->id}/issues/{$issue1->id}/position", [
                'position' => 10,
            ]);
        $reorderResponse->assertStatus(200)->assertJsonPath('data.position', 10);

        // Remove Issue 1
        $removeResponse = $this->actingAs($this->user)
            ->deleteJson("/api/v1/sprints/{$sprint->id}/issues/{$issue1->id}");

        $removeResponse->assertStatus(200);
        $this->assertDatabaseMissing('sprint_issues', [
            'sprint_id' => $sprint->id,
            'issue_id' => $issue1->id,
        ]);
        // Confirm Issue 1 was NOT deleted
        $this->assertDatabaseHas('issues', ['id' => $issue1->id]);
    }

    public function test_backlog_endpoint_returns_unscheduled_issues(): void
    {
        $sprint = Sprint::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Active Sprint',
            'status' => 'active',
            'created_by' => $this->user->id,
        ]);

        $scheduledIssue = Issue::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Scheduled Issue',
            'reporter_id' => $this->user->id,
        ]);

        $backlogIssue = Issue::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'issue_number' => 2,
            'title' => 'Backlog Issue',
            'reporter_id' => $this->user->id,
            'backlog_position' => 1,
        ]);

        // Attach scheduled issue to active sprint
        $this->actingAs($this->user)
            ->postJson("/api/v1/sprints/{$sprint->id}/issues", [
                'issue_id' => $scheduledIssue->id,
            ]);

        // Query backlog
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/projects/{$this->project->id}/backlog");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.id', $backlogIssue->id);
    }
}
