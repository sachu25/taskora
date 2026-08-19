<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Label;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationIssueTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;
    private Organization $orgA;
    private Project $projectA;
    private Issue $issueA;

    private User $userB;
    private Organization $orgB;
    private Project $projectB;
    private Issue $issueB;

    protected function setUp(): void
    {
        parent::setUp();

        // Org A setup
        $this->userA = User::factory()->create();
        $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
        OrganizationMember::create([
            'organization_id' => $this->orgA->id,
            'user_id' => $this->userA->id,
            'role' => 'organization_admin',
            'status' => 'active',
            'joined_at' => now(),
        ]);
        $this->projectA = Project::create([
            'organization_id' => $this->orgA->id,
            'name' => 'Project A',
            'key' => 'PROJA',
            'slug' => 'project-a',
            'status' => 'active',
            'visibility' => 'private',
            'created_by' => $this->userA->id,
        ]);
        $this->issueA = Issue::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projectA->id,
            'issue_number' => 1,
            'title' => 'Org A Issue',
            'reporter_id' => $this->userA->id,
        ]);

        // Org B setup
        $this->userB = User::factory()->create();
        $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);
        OrganizationMember::create([
            'organization_id' => $this->orgB->id,
            'user_id' => $this->userB->id,
            'role' => 'organization_admin',
            'status' => 'active',
            'joined_at' => now(),
        ]);
        $this->projectB = Project::create([
            'organization_id' => $this->orgB->id,
            'name' => 'Project B',
            'key' => 'PROJB',
            'slug' => 'project-b',
            'status' => 'active',
            'visibility' => 'private',
            'created_by' => $this->userB->id,
        ]);
        $this->issueB = Issue::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projectB->id,
            'issue_number' => 1,
            'title' => 'Org B Issue',
            'reporter_id' => $this->userB->id,
        ]);
    }

    public function test_user_a_cannot_view_issue_in_org_b(): void
    {
        $response = $this->actingAs($this->userA, 'sanctum')
            ->getJson("/api/v1/issues/{$this->issueB->id}");

        $response->assertStatus(403);
    }

    public function test_user_a_cannot_create_issue_in_project_b(): void
    {
        $response = $this->actingAs($this->userA, 'sanctum')
            ->postJson("/api/v1/projects/{$this->projectB->id}/issues", [
                'title' => 'Unauthorized Issue',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_a_cannot_assign_user_b_to_issue_a(): void
    {
        $response = $this->actingAs($this->userA, 'sanctum')
            ->patchJson("/api/v1/issues/{$this->issueA->id}", [
                'assignee_id' => $this->userB->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_user_a_cannot_attach_org_b_label_to_issue_a(): void
    {
        $labelB = Label::create([
            'organization_id' => $this->orgB->id,
            'name' => 'Label B',
            'color' => '#ff0000',
        ]);

        $response = $this->actingAs($this->userA, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issueA->id}/labels/{$labelB->id}");

        $response->assertStatus(422);
    }

    public function test_user_a_cannot_link_issue_a_to_issue_b(): void
    {
        $response = $this->actingAs($this->userA, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issueA->id}/links", [
                'linked_issue_id' => $this->issueB->id,
                'link_type' => 'blocks',
            ]);

        $response->assertStatus(422);
    }
}
