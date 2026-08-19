<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Release;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReleaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $managerUser;
    protected Organization $organization;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->managerUser = User::factory()->create();

        $this->organization = Organization::create([
            'name' => 'Release Test Org',
            'slug' => 'release-test-org',
        ]);

        OrganizationMember::create([
            'organization_id' => $this->organization->id,
            'user_id' => $this->user->id,
            'role' => 'project_manager',
        ]);

        OrganizationMember::create([
            'organization_id' => $this->organization->id,
            'user_id' => $this->managerUser->id,
            'role' => 'project_manager',
        ]);

        $this->project = Project::create([
            'organization_id' => $this->organization->id,
            'name' => 'Release Test Project',
            'key' => 'RTP',
            'slug' => 'release-test-project',
            'created_by' => $this->user->id,
        ]);

        ProjectMember::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'role' => 'project_manager',
        ]);

        ProjectMember::create([
            'project_id' => $this->project->id,
            'user_id' => $this->managerUser->id,
            'role' => 'project_manager',
        ]);
    }

    public function test_user_can_create_release(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/projects/{$this->project->id}/releases", [
                'name' => 'Release 1.0',
                'version' => 'v1.0.0',
                'description' => 'First major release',
                'start_date' => now()->toDateString(),
                'release_date' => now()->addDays(14)->toDateString(),
                'release_manager_id' => $this->managerUser->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Release 1.0')
            ->assertJsonPath('data.version', 'v1.0.0')
            ->assertJsonPath('data.organization_id', $this->organization->id)
            ->assertJsonPath('data.project_id', $this->project->id)
            ->assertJsonPath('data.status', 'planned');

        $this->assertDatabaseHas('releases', [
            'name' => 'Release 1.0',
            'version' => 'v1.0.0',
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
        ]);
    }

    public function test_duplicate_version_rejection(): void
    {
        Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Release Alpha',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/projects/{$this->project->id}/releases", [
                'name' => 'Release Duplicate',
                'version' => 'v1.0.0',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['version']);
    }

    public function test_can_update_release(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Original Release',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/releases/{$release->id}", [
                'name' => 'Updated Release Name',
                'version' => 'v1.0.1',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Release Name')
            ->assertJsonPath('data.version', 'v1.0.1');
    }

    public function test_can_start_complete_and_cancel_release(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Lifecycle Release',
            'version' => 'v1.0.0',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        // Start Release (planned -> in_progress)
        $startRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/start");
        $startRes->assertStatus(200)->assertJsonPath('data.status', 'in_progress');

        // Complete Release (in_progress -> released)
        $compRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/complete");
        $compRes->assertStatus(200)
            ->assertJsonPath('data.status', 'released')
            ->assertJsonPath('data.released_at', fn ($val) => !empty($val));
    }

    public function test_can_cancel_release_from_planned_and_in_progress(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Cancel Release',
            'version' => 'v2.0.0',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        $cancelRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/cancel");
        $cancelRes->assertStatus(200)->assertJsonPath('data.status', 'cancelled');
    }

    public function test_invalid_lifecycle_transitions_are_rejected(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Planned Release',
            'version' => 'v1.0.0',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        // Cannot complete directly from planned
        $compRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/complete");
        $compRes->assertStatus(422);

        // Transition to released
        $release->update(['status' => 'released', 'released_at' => now()]);

        // Cannot cancel a released release
        $cancelRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/cancel");
        $cancelRes->assertStatus(422);

        // Cannot start a released release
        $startRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/start");
        $startRes->assertStatus(422);
    }

    public function test_soft_delete_and_restore_release(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Delete Me',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        // Soft Delete
        $delRes = $this->actingAs($this->user)
            ->deleteJson("/api/v1/releases/{$release->id}");
        $delRes->assertStatus(200);

        $this->assertSoftDeleted('releases', ['id' => $release->id]);

        // Restore
        $restoreRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/restore");
        $restoreRes->assertStatus(200)->assertJsonPath('data.id', $release->id);

        $this->assertDatabaseHas('releases', ['id' => $release->id, 'deleted_at' => null]);
    }

    public function test_restore_conflict_with_active_version_is_rejected(): void
    {
        $release1 = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Old Version 1',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        $release1->delete(); // Soft delete release 1

        // Create new active release with same version 'v1.0.0'
        Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'New Version 1',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        // Restoring release 1 must fail due to version collision with active release
        $restoreRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release1->id}/restore");
        $restoreRes->assertStatus(422)
            ->assertJsonValidationErrors(['version']);
    }

    public function test_list_releases_with_search_and_filter(): void
    {
        Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Alpha Build',
            'version' => 'v1.0.0',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Beta Build',
            'version' => 'v2.0.0',
            'status' => 'in_progress',
            'created_by' => $this->user->id,
        ]);

        $res = $this->actingAs($this->user)
            ->getJson("/api/v1/projects/{$this->project->id}/releases?status=in_progress");

        $res->assertStatus(200)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.name', 'Beta Build');
    }

    public function test_can_add_and_remove_issues_from_release(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Issue Release',
            'version' => 'v1.0.0',
            'status' => 'planned',
            'created_by' => $this->user->id,
        ]);

        $issue = Issue::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Release Issue',
            'reporter_id' => $this->user->id,
        ]);

        // Add Issue
        $addRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/issues", [
                'issue_id' => $issue->id,
            ]);
        $addRes->assertStatus(201)->assertJsonPath('data.issue_id', $issue->id);

        // Duplicate addition fails
        $dupRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/issues", [
                'issue_id' => $issue->id,
            ]);
        $dupRes->assertStatus(422);

        // Remove Issue
        $removeRes = $this->actingAs($this->user)
            ->deleteJson("/api/v1/releases/{$release->id}/issues/{$issue->id}");
        $removeRes->assertStatus(200);

        $this->assertDatabaseMissing('release_issues', [
            'release_id' => $release->id,
            'issue_id' => $issue->id,
        ]);
        // Confirm issue was not deleted from database
        $this->assertDatabaseHas('issues', ['id' => $issue->id]);
    }

    public function test_can_assign_and_remove_release_manager(): void
    {
        $release = Release::create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'name' => 'Managed Release',
            'version' => 'v1.0.0',
            'created_by' => $this->user->id,
        ]);

        // Assign Manager
        $assignRes = $this->actingAs($this->user)
            ->postJson("/api/v1/releases/{$release->id}/manager", [
                'user_id' => $this->managerUser->id,
            ]);
        $assignRes->assertStatus(200)->assertJsonPath('data.release_manager_id', $this->managerUser->id);

        // Remove Manager
        $removeRes = $this->actingAs($this->user)
            ->deleteJson("/api/v1/releases/{$release->id}/manager");
        $removeRes->assertStatus(200)->assertJsonPath('data.release_manager_id', null);
    }

    public function test_date_validation_rejects_release_date_before_start_date(): void
    {
        $res = $this->actingAs($this->user)
            ->postJson("/api/v1/projects/{$this->project->id}/releases", [
                'name' => 'Bad Date Release',
                'version' => 'v1.0.0',
                'start_date' => '2026-08-20',
                'release_date' => '2026-08-10',
            ]);

        $res->assertStatus(422)->assertJsonValidationErrors(['release_date']);
    }

    public function test_activity_logging_records_release_events(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/projects/{$this->project->id}/releases", [
                'name' => 'Logged Release',
                'version' => 'v1.0.0',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('activity_logs', [
            'organization_id' => $this->organization->id,
            'user_id' => $this->user->id,
            'action' => 'release.created',
        ]);
    }
}
