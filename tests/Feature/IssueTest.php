<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->org = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
        ]);

        OrganizationMember::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'role' => 'organization_admin',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        $this->project = Project::create([
            'organization_id' => $this->org->id,
            'name' => 'Web App',
            'key' => 'WEB',
            'slug' => 'web-app',
            'status' => 'active',
            'visibility' => 'organization',
            'created_by' => $this->user->id,
        ]);
    }

    public function test_user_can_create_issue(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/projects/{$this->project->id}/issues", [
                'title' => 'Fix header navigation bug',
                'description' => 'Navigation links are unaligned on desktop viewport.',
                'issue_type' => 'bug',
                'priority' => 'high',
                'severity' => 'major',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.key', 'WEB-1')
            ->assertJsonPath('data.issue_number', 1)
            ->assertJsonPath('data.title', 'Fix header navigation bug');

        $this->assertDatabaseHas('issues', [
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'reporter_id' => $this->user->id,
        ]);
    }

    public function test_issues_receive_sequential_numbers(): void
    {
        $issue1 = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/projects/{$this->project->id}/issues", [
                'title' => 'First issue',
            ])->json('data');

        $issue2 = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/projects/{$this->project->id}/issues", [
                'title' => 'Second issue',
            ])->json('data');

        $this->assertEquals('WEB-1', $issue1['key']);
        $this->assertEquals('WEB-2', $issue2['key']);
    }

    public function test_can_list_and_filter_issues(): void
    {
        Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Searchable bug title',
            'issue_type' => 'bug',
            'status' => 'todo',
            'priority' => 'urgent',
            'reporter_id' => $this->user->id,
        ]);

        Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 2,
            'title' => 'Another task',
            'issue_type' => 'task',
            'status' => 'done',
            'priority' => 'low',
            'reporter_id' => $this->user->id,
        ]);

        // Filter by type
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/projects/{$this->project->id}/issues?type=bug");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.key', 'WEB-1');

        // Search by title
        $searchResponse = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/projects/{$this->project->id}/issues?search=Searchable");

        $searchResponse->assertStatus(200)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_can_update_issue_and_change_status(): void
    {
        $issue = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Initial Title',
            'status' => 'todo',
            'reporter_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/v1/issues/{$issue->id}", [
                'status' => 'in_progress',
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'issue.status_changed',
        ]);
    }

    public function test_can_soft_delete_and_restore_issue(): void
    {
        $issue = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'To be deleted',
            'reporter_id' => $this->user->id,
        ]);

        // Soft delete
        $deleteResponse = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/v1/issues/{$issue->id}");

        $deleteResponse->assertStatus(200);
        $this->assertSoftDeleted('issues', ['id' => $issue->id]);

        // Restore
        $restoreResponse = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$issue->id}/restore");

        $restoreResponse->assertStatus(200)
            ->assertJsonPath('data.id', $issue->id);

        $this->assertDatabaseHas('issues', ['id' => $issue->id, 'deleted_at' => null]);
    }

    public function test_parent_child_issue_relationship(): void
    {
        $parent = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Parent Issue',
            'reporter_id' => $this->user->id,
        ]);

        $childResponse = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/projects/{$this->project->id}/issues", [
                'title' => 'Child Issue',
                'parent_id' => $parent->id,
            ]);

        $childResponse->assertStatus(201)
            ->assertJsonPath('data.parent_id', $parent->id);

        // Self parent rejected
        $selfParentResponse = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/v1/issues/{$parent->id}", [
                'parent_id' => $parent->id,
            ]);

        $selfParentResponse->assertStatus(422);
    }
}
