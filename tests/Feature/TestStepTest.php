<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestCase as TestCaseModel;
use App\Models\TestStep;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestStepTest extends TestCase
{
    use RefreshDatabase;

    private User $tester;
    private Organization $org;
    private Project $project;
    private TestCaseModel $testCase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create(['name' => 'QA Org', 'slug' => 'qa-org']);
        $this->tester = User::factory()->create();

        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->project = Project::create([
            'organization_id' => $this->org->id,
            'name' => 'QA Project',
            'key' => 'QAP',
            'slug' => 'qa-project',
            'created_by' => $this->tester->id,
        ]);

        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->testCase = TestCaseModel::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'case_number' => 1,
            'title' => 'Sample Test Case',
            'created_by' => $this->tester->id,
        ]);
    }

    public function test_can_add_update_and_reorder_test_steps(): void
    {
        // 1. Add step 1
        $res1 = $this->actingAs($this->tester)->postJson("/api/v1/test-cases/{$this->testCase->id}/steps", [
            'action' => 'Open login page',
            'expected_result' => 'Login form displayed',
        ]);

        $res1->assertStatus(201)
            ->assertJsonPath('data.step_number', 1);

        // 2. Add step 2
        $res2 = $this->actingAs($this->tester)->postJson("/api/v1/test-cases/{$this->testCase->id}/steps", [
            'action' => 'Submit valid credentials',
            'expected_result' => 'Redirected to dashboard',
        ]);

        $res2->assertStatus(201)
            ->assertJsonPath('data.step_number', 2);

        // 3. Reorder step 2 to position 1
        $step2Id = $res2->json('data.id');
        $reorderRes = $this->actingAs($this->tester)->patchJson("/api/v1/test-cases/{$this->testCase->id}/steps/{$step2Id}/position", [
            'position' => 1,
        ]);

        $reorderRes->assertStatus(200)
            ->assertJsonPath('data.step_number', 1);
    }
}
