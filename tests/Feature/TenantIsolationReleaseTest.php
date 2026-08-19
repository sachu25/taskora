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

class TenantIsolationReleaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;
    protected User $userB;
    protected Organization $orgA;
    protected Organization $orgB;
    protected Project $projA;
    protected Project $projB;
    protected Project $projA2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userA = User::factory()->create();
        $this->userB = User::factory()->create();

        // Org A
        $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
        OrganizationMember::create(['organization_id' => $this->orgA->id, 'user_id' => $this->userA->id, 'role' => 'project_manager']);

        $this->projA = Project::create([
            'organization_id' => $this->orgA->id,
            'name' => 'Project A',
            'key' => 'PA',
            'slug' => 'project-a',
            'created_by' => $this->userA->id,
        ]);
        ProjectMember::create(['project_id' => $this->projA->id, 'user_id' => $this->userA->id, 'role' => 'project_manager']);

        $this->projA2 = Project::create([
            'organization_id' => $this->orgA->id,
            'name' => 'Project A2',
            'key' => 'PA2',
            'slug' => 'project-a2',
            'created_by' => $this->userA->id,
        ]);
        ProjectMember::create(['project_id' => $this->projA2->id, 'user_id' => $this->userA->id, 'role' => 'project_manager']);

        // Org B
        $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);
        OrganizationMember::create(['organization_id' => $this->orgB->id, 'user_id' => $this->userB->id, 'role' => 'project_manager']);

        $this->projB = Project::create([
            'organization_id' => $this->orgB->id,
            'name' => 'Project B',
            'key' => 'PB',
            'slug' => 'project-b',
            'created_by' => $this->userB->id,
        ]);
        ProjectMember::create(['project_id' => $this->projB->id, 'user_id' => $this->userB->id, 'role' => 'project_manager']);
    }

    public function test_user_a_cannot_view_org_b_releases(): void
    {
        $relB = Release::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'name' => 'Release Org B',
            'version' => 'v1.0.0',
            'created_by' => $this->userB->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->getJson("/api/v1/releases/{$relB->id}");

        $res->assertStatus(403);
    }

    public function test_user_a_cannot_update_org_b_release(): void
    {
        $relB = Release::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'name' => 'Release Org B',
            'version' => 'v1.0.0',
            'created_by' => $this->userB->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->patchJson("/api/v1/releases/{$relB->id}", ['name' => 'Hacked Name']);

        $res->assertStatus(403);
    }

    public function test_user_a_cannot_delete_org_b_release(): void
    {
        $relB = Release::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'name' => 'Release Org B',
            'version' => 'v1.0.0',
            'created_by' => $this->userB->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->deleteJson("/api/v1/releases/{$relB->id}");

        $res->assertStatus(403);
    }

    public function test_user_a_cannot_restore_org_b_release(): void
    {
        $relB = Release::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'name' => 'Release Org B',
            'version' => 'v1.0.0',
            'created_by' => $this->userB->id,
        ]);
        $relB->delete();

        $res = $this->actingAs($this->userA)
            ->postJson("/api/v1/releases/{$relB->id}/restore");

        $res->assertStatus(403);
    }

    public function test_user_a_cannot_start_complete_or_cancel_org_b_release(): void
    {
        $relB = Release::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'name' => 'Release Org B',
            'version' => 'v1.0.0',
            'status' => 'planned',
            'created_by' => $this->userB->id,
        ]);

        $startRes = $this->actingAs($this->userA)->postJson("/api/v1/releases/{$relB->id}/start");
        $startRes->assertStatus(403);

        $relB->update(['status' => 'in_progress']);

        $compRes = $this->actingAs($this->userA)->postJson("/api/v1/releases/{$relB->id}/complete");
        $compRes->assertStatus(403);

        $cancelRes = $this->actingAs($this->userA)->postJson("/api/v1/releases/{$relB->id}/cancel");
        $cancelRes->assertStatus(403);
    }

    public function test_user_cannot_attach_org_b_issue_to_org_a_release(): void
    {
        $relA = Release::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projA->id,
            'name' => 'Release Org A',
            'version' => 'v1.0.0',
            'created_by' => $this->userA->id,
        ]);

        $issueB = Issue::create([
            'organization_id' => $this->orgB->id,
            'project_id' => $this->projB->id,
            'issue_number' => 1,
            'title' => 'Org B Issue',
            'reporter_id' => $this->userB->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->postJson("/api/v1/releases/{$relA->id}/issues", [
                'issue_id' => $issueB->id,
            ]);

        $res->assertStatus(422);
    }

    public function test_user_cannot_attach_issue_from_different_project_in_same_org(): void
    {
        $relA = Release::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projA->id,
            'name' => 'Release Proj A1',
            'version' => 'v1.0.0',
            'created_by' => $this->userA->id,
        ]);

        $issueA2 = Issue::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projA2->id,
            'issue_number' => 1,
            'title' => 'Proj A2 Issue',
            'reporter_id' => $this->userA->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->postJson("/api/v1/releases/{$relA->id}/issues", [
                'issue_id' => $issueA2->id,
            ]);

        $res->assertStatus(422);
    }

    public function test_user_cannot_assign_org_b_user_as_release_manager(): void
    {
        $relA = Release::create([
            'organization_id' => $this->orgA->id,
            'project_id' => $this->projA->id,
            'name' => 'Release Org A',
            'version' => 'v1.0.0',
            'created_by' => $this->userA->id,
        ]);

        $res = $this->actingAs($this->userA)
            ->postJson("/api/v1/releases/{$relA->id}/manager", [
                'user_id' => $this->userB->id,
            ]);

        $res->assertStatus(422);
    }
}
