<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestCase as TestCaseModel;
use App\Models\TestRun;
use App\Models\TestRunCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestExecutionTest extends TestCase
{
    use RefreshDatabase;

    private User $tester;
    private Organization $org;
    private Project $project;
    private TestRun $activeRun;
    private TestRun $plannedRun;
    private TestCaseModel $testCase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create(['name' => 'QA Org', 'slug' => 'qa-org']);
        $this->tester = User::factory()->create();

        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->project = Project::create(['organization_id' => $this->org->id, 'name' => 'Proj QA', 'key' => 'PQA', 'slug' => 'proj-qa', 'created_by' => $this->tester->id]);
        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->testCase = TestCaseModel::create(['organization_id' => $this->org->id, 'project_id' => $this->project->id, 'case_number' => 1, 'title' => 'Test Case 1', 'created_by' => $this->tester->id]);

        $this->activeRun = TestRun::create(['organization_id' => $this->org->id, 'project_id' => $this->project->id, 'name' => 'Active Run', 'status' => 'active', 'created_by' => $this->tester->id]);
        $this->plannedRun = TestRun::create(['organization_id' => $this->org->id, 'project_id' => $this->project->id, 'name' => 'Planned Run', 'status' => 'planned', 'created_by' => $this->tester->id]);

        TestRunCase::create(['test_run_id' => $this->activeRun->id, 'test_case_id' => $this->testCase->id, 'position' => 1, 'created_by' => $this->tester->id]);
        TestRunCase::create(['test_run_id' => $this->plannedRun->id, 'test_case_id' => $this->testCase->id, 'position' => 1, 'created_by' => $this->tester->id]);
    }

    public function test_can_execute_and_reset_test_case_on_active_run(): void
    {
        // Execute on active run
        $execRes = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$this->activeRun->id}/cases/{$this->testCase->id}/execute", [
            'status' => 'passed',
            'actual_result' => 'All steps verified',
        ]);

        $execRes->assertStatus(200)
            ->assertJsonPath('data.status', 'passed');

        $this->assertDatabaseHas('test_executions', [
            'test_run_id' => $this->activeRun->id,
            'test_case_id' => $this->testCase->id,
            'status' => 'passed',
        ]);

        // Reset execution
        $resetRes = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$this->activeRun->id}/cases/{$this->testCase->id}/reset");
        $resetRes->assertStatus(200)
            ->assertJsonPath('data.status', 'not_run');
    }

    public function test_cannot_execute_test_case_on_non_active_run(): void
    {
        $res = $this->actingAs($this->tester)->postJson("/api/v1/test-runs/{$this->plannedRun->id}/cases/{$this->testCase->id}/execute", [
            'status' => 'passed',
        ]);

        $res->assertStatus(422);
    }
}
