<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestCase as TestCaseModel;
use App\Models\TestRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestRunTest extends TestCase
{
    use RefreshDatabase;

    private User $tester;
    private Organization $org;
    private Project $projectA;
    private Project $projectB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create(['name' => 'QA Org', 'slug' => 'qa-org']);
        $this->tester = User::factory()->create();

        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->projectA = Project::create(['organization_id' => $this->org->id, 'name' => 'Proj A', 'key' => 'PJA', 'slug' => 'proj-a', 'created_by' => $this->tester->id]);
        $this->projectB = Project::create(['organization_id' => $this->org->id, 'name' => 'Proj B', 'key' => 'PJB', 'slug' => 'proj-b', 'created_by' => $this->tester->id]);

        ProjectMember::create(['project_id' => $this->projectA->id, 'user_id' => $this->tester->id, 'role' => 'tester']);
        ProjectMember::create(['project_id' => $this->projectB->id, 'user_id' => $this->tester->id, 'role' => 'tester']);
    }

    public function test_can_create_and_manage_test_run_lifecycle(): void
    {
        // 1. Create Planned Run
        $res = $this->actingAs($this->tester)->postJson("/api/v1/projects/{$this->projectA->id}/test-runs", [
            'name' => 'Sprint 1 QA Run',
            'environment' => 'staging',
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.status', 'planned');

        $runId = $res->json('data.id');

        // 2. Start Run (planned -> active)
        $startRes = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$runId}/start");
        $startRes->assertStatus(200)
            ->assertJsonPath('data.status', 'active');

        // 3. Complete Run (active -> completed)
        $completeRes = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$runId}/complete");
        $completeRes->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        // 4. Invalid Transition (completed -> active) MUST return 422
        $invalidRes = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$runId}/start");
        $invalidRes->assertStatus(422);
    }

    public function test_cannot_add_test_case_from_different_project_to_run(): void
    {
        $run = TestRun::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->projectA->id,
            'name' => 'Run A',
            'created_by' => $this->tester->id,
        ]);

        $tcB = TestCaseModel::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->projectB->id,
            'case_number' => 1,
            'title' => 'Test Case B',
            'created_by' => $this->tester->id,
        ]);

        $res = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$run->id}/cases", [
            'test_case_id' => $tcB->id,
        ]);

        $res->assertStatus(422);
    }
}
