<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\TestCase as TestCaseModel;
use App\Models\TestRun;
use App\Models\TestSuite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationQA_Test extends TestCase
{
    use RefreshDatabase;

    private User $userOrgA;
    private User $userOrgB;
    private Organization $orgA;
    private Organization $orgB;
    private Project $projectA;
    private Project $projectB;
    private TestSuite $suiteB;
    private TestCaseModel $caseB;
    private TestRun $runB;

    protected function setUp(): void
    {
        parent::setUp();

        // Org A
        $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
        $this->userOrgA = User::factory()->create();
        OrganizationMember::create(['organization_id' => $this->orgA->id, 'user_id' => $this->userOrgA->id, 'role' => 'organization_admin']);
        $this->projectA = Project::create(['organization_id' => $this->orgA->id, 'name' => 'Proj A', 'key' => 'PJA', 'slug' => 'proj-a', 'created_by' => $this->userOrgA->id]);

        // Org B
        $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);
        $this->userOrgB = User::factory()->create();
        OrganizationMember::create(['organization_id' => $this->orgB->id, 'user_id' => $this->userOrgB->id, 'role' => 'organization_admin']);
        $this->projectB = Project::create(['organization_id' => $this->orgB->id, 'name' => 'Proj B', 'key' => 'PJB', 'slug' => 'proj-b', 'created_by' => $this->userOrgB->id]);

        $this->suiteB = TestSuite::create(['organization_id' => $this->orgB->id, 'project_id' => $this->projectB->id, 'name' => 'Suite B', 'created_by' => $this->userOrgB->id]);
        $this->caseB = TestCaseModel::create(['organization_id' => $this->orgB->id, 'project_id' => $this->projectB->id, 'case_number' => 1, 'title' => 'Case B', 'created_by' => $this->userOrgB->id]);
        $this->runB = TestRun::create(['organization_id' => $this->orgB->id, 'project_id' => $this->projectB->id, 'name' => 'Run B', 'status' => 'active', 'created_by' => $this->userOrgB->id]);
    }

    public function test_user_a_cannot_view_org_b_test_suites(): void
    {
        $response = $this->actingAs($this->userOrgA)->getJson("/api/v1/projects/{$this->projectB->id}/test-suites");
        $response->assertStatus(403);

        $showRes = $this->actingAs($this->userOrgA)->getJson("/api/v1/test-suites/{$this->suiteB->id}");
        $showRes->assertStatus(403);
    }

    public function test_user_a_cannot_modify_or_delete_org_b_test_cases(): void
    {
        $updateRes = $this->actingAs($this->userOrgA)->patchJson("/api/v1/test-cases/{$this->caseB->id}", ['title' => 'Hacked']);
        $updateRes->assertStatus(403);

        $deleteRes = $this->actingAs($this->userOrgA)->deleteJson("/api/v1/test-cases/{$this->caseB->id}");
        $deleteRes->assertStatus(403);
    }

    public function test_user_a_cannot_execute_tests_on_org_b_runs(): void
    {
        $execRes = $this->actingAs($this->userOrgA)->postJson("/api/v1/test-runs/{$this->runB->id}/cases/{$this->caseB->id}/execute", [
            'status' => 'passed',
        ]);
        $execRes->assertStatus(403);
    }

    public function test_user_a_cannot_create_test_case_in_org_b_project(): void
    {
        $res = $this->actingAs($this->userOrgA)->postJson("/api/v1/projects/{$this->projectB->id}/test-cases", [
            'title' => 'Unauthorized Case',
        ]);
        $res->assertStatus(403);
    }
}
