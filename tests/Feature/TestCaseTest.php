<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestCase as TestCaseModel;
use App\Models\TestSuite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestCaseTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tester;
    private Organization $org;
    private Project $project;
    private TestSuite $suite;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create([
            'name' => 'QA Test Org',
            'slug' => 'qa-test-org',
        ]);

        $this->admin = User::factory()->create();
        $this->tester = User::factory()->create();

        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->admin->id, 'role' => 'organization_admin']);
        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->project = Project::create([
            'organization_id' => $this->org->id,
            'name' => 'QA Project',
            'key' => 'QAP',
            'slug' => 'qa-project',
            'created_by' => $this->admin->id,
        ]);

        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->admin->id, 'role' => 'project_manager']);
        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->tester->id, 'role' => 'tester']);

        $this->suite = TestSuite::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'name' => 'Regression Suite',
            'created_by' => $this->tester->id,
        ]);
    }

    public function test_user_can_create_test_case_with_sequential_numbering(): void
    {
        $res1 = $this->actingAs($this->tester)->postJson("/api/v1/projects/{$this->project->id}/test-cases", [
            'suite_id' => $this->suite->id,
            'title' => 'Verify User Registration',
            'test_type' => 'functional',
            'priority' => 'high',
        ]);

        $res1->assertStatus(201)
            ->assertJsonPath('data.case_number', 1)
            ->assertJsonPath('data.key', 'TC-QAP-001');

        $res2 = $this->actingAs($this->tester)->postJson("/api/v1/projects/{$this->project->id}/test-cases", [
            'suite_id' => $this->suite->id,
            'title' => 'Verify User Password Reset',
            'test_type' => 'security',
            'priority' => 'critical',
        ]);

        $res2->assertStatus(201)
            ->assertJsonPath('data.case_number', 2)
            ->assertJsonPath('data.key', 'TC-QAP-002');
    }

    public function test_can_list_and_filter_test_cases(): void
    {
        TestCaseModel::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'suite_id' => $this->suite->id,
            'case_number' => 1,
            'title' => 'Smoke Auth Test',
            'test_type' => 'smoke',
            'priority' => 'high',
            'status' => 'ready',
            'created_by' => $this->tester->id,
        ]);

        TestCaseModel::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'suite_id' => $this->suite->id,
            'case_number' => 2,
            'title' => 'Security Token Test',
            'test_type' => 'security',
            'priority' => 'critical',
            'status' => 'draft',
            'created_by' => $this->tester->id,
        ]);

        $res = $this->actingAs($this->tester)->getJson("/api/v1/projects/{$this->project->id}/test-cases?test_type=smoke");

        $res->assertStatus(200)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.key', 'TC-QAP-001');
    }

    public function test_can_soft_delete_and_restore_test_case(): void
    {
        $tc = TestCaseModel::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'suite_id' => $this->suite->id,
            'case_number' => 1,
            'title' => 'Test Case to Delete',
            'created_by' => $this->tester->id,
        ]);

        $delRes = $this->actingAs($this->admin)->deleteJson("/api/v1/test-cases/{$tc->id}");
        $delRes->assertStatus(200);

        $this->assertSoftDeleted('test_cases', ['id' => $tc->id]);

        $resRes = $this->actingAs($this->admin)->postJson("/api/v1/test-cases/{$tc->id}/restore");
        $resRes->assertStatus(200);

        $this->assertDatabaseHas('test_cases', ['id' => $tc->id, 'deleted_at' => null]);
    }
}
