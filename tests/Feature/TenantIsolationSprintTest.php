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

class TenantIsolationSprintTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;
    protected Organization $orgA;
    protected Project $projectA;

    protected User $userB;
    protected Organization $orgB;
    protected Project $projectB;

    protected function setUp(): void
    {
        parent::setUp();

        // Org A Setup
        $this->userA = User::factory()->create();
        $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
        OrganizationMember::create(['organization_id' => $this->orgA->id, 'user_id' => $this->userA->id, 'role' => 'project_manager']);
        $this->projectA = Project::create(['organization_id' => $this->orgA->id, 'name' => 'Project A', 'key' => 'PA', 'slug' => 'project-a', 'created_by' => $this->userA->id]);
        ProjectMember::create(['project_id' => $this->projectA->id, 'user_id' => $this->userA->id, 'role' => 'project_manager']);

        // Org B Setup
        $this->userB = User::factory()->create();
        $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);
        OrganizationMember::create(['organization_id' => $this->orgB->id, 'user_id' => $this->userB->id, 'role' => 'project_manager']);
        $this->projectB = Project::create(['organization_id' => $this->orgB->id, 'name' => 'Project B', 'key' => 'PB', 'slug' => 'project-b', 'created_by' => $this->userB->id]);
        ProjectMember::create(['project_id' => $this->projectB->id, 'user_id' => $this->userB->id, 'role' => 'project_manager']);
    }

    public function test_user_a_cannot_view_org_b_sprint(): void
    {
        $sprintB = Sprint::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'name' => 'Sprint B',
            'created_by' => $this->userB->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->getJson("/api/v1/sprints/{$sprintB->id}");

        $response->assertStatus(403);
    }

    public function test_user_a_cannot_update_org_b_sprint(): void
    {
        $sprintB = Sprint::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'name' => 'Sprint B',
            'created_by' => $this->userB->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->patchJson("/api/v1/sprints/{$sprintB->id}", [
                'name' => 'Hacked Sprint Name',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_a_cannot_delete_org_b_sprint(): void
    {
        $sprintB = Sprint::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'name' => 'Sprint B',
            'created_by' => $this->userB->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->deleteJson("/api/v1/sprints/{$sprintB->id}");

        $response->assertStatus(403);
    }

    public function test_user_cannot_add_org_b_issue_to_org_a_sprint(): void
    {
        $sprintA = Sprint::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projectA->id,
            'name' => 'Sprint A',
            'created_by' => $this->userA->id,
        ]);

        $issueB = Issue::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'issue_number' => 1,
            'title' => 'Issue in Org B',
            'reporter_id' => $this->userB->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->postJson("/api/v1/sprints/{$sprintA->id}/issues", [
                'issue_id' => $issueB->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_user_cannot_add_issue_from_different_project_to_sprint(): void
    {
        $projectA2 = Project::create([
            'organization_id' => $this->orgA->id,
            'name' => 'Project A2',
            'key' => 'PA2',
            'slug' => 'project-a2',
            'created_by' => $this->userA->id,
        ]);

        $sprintA1 = Sprint::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projectA->id,
            'name' => 'Sprint A1',
            'created_by' => $this->userA->id,
        ]);

        $issueA2 = Issue::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $projectA2->id,
            'issue_number' => 1,
            'title' => 'Issue in Project A2',
            'reporter_id' => $this->userA->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->postJson("/api/v1/sprints/{$sprintA1->id}/issues", [
                'issue_id' => $issueA2->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_user_a_cannot_start_sprint_in_org_b(): void
    {
        $sprintB = Sprint::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'name' => 'Sprint B',
            'status' => 'planned',
            'created_by' => $this->userB->id,
        ]);

        $response = $this->actingAs($this->userA)
            ->postJson("/api/v1/sprints/{$sprintB->id}/start", [
                'end_date' => now()->addDays(14)->toDateString(),
            ]);

        $response->assertStatus(403);
    }
}
