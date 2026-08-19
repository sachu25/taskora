<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestSuite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestSuiteTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tester;
    private User $reporter;
    private Organization $org;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::create([
            'name' => 'QA Test Org',
            'slug' => 'qa-test-org',
        ]);

        $this->admin = User::factory()->create();
        $this->tester = User::factory()->create();
        $this->reporter = User::factory()->create();

        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->admin->id, 'role' => 'organization_admin']);
        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->tester->id, 'role' => 'tester']);
        OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $this->reporter->id, 'role' => 'reporter']);

        $this->project = Project::create([
            'organization_id' => $this->org->id,
            'name' => 'QA Project',
            'key' => 'QAP',
            'slug' => 'qa-project',
            'created_by' => $this->admin->id,
        ]);

        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->admin->id, 'role' => 'project_manager']);
        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->tester->id, 'role' => 'tester']);
        ProjectMember::create(['project_id' => $this->project->id, 'user_id' => $this->reporter->id, 'role' => 'reporter']);
    }

    public function test_user_can_create_test_suite(): void
    {
        $response = $this->actingAs($this->tester)->postJson("/api/v1/projects/{$this->project->id}/test-suites", [
            'name' => 'Smoke Test Suite',
            'description' => 'Verifies build stability',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Smoke Test Suite');

        $this->assertDatabaseHas('test_suites', [
            'project_id' => $this->project->id,
            'name' => 'Smoke Test Suite',
        ]);
    }

    public function test_reporter_cannot_create_test_suite(): void
    {
        $response = $this->actingAs($this->reporter)->postJson("/api/v1/projects/{$this->project->id}/test-suites", [
            'name' => 'Unauthorized Suite',
        ]);

        $response->assertStatus(403);
    }

    public function test_can_list_and_filter_test_suites(): void
    {
        TestSuite::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'name' => 'Suite Alpha',
            'status' => 'active',
            'created_by' => $this->admin->id,
        ]);

        TestSuite::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'name' => 'Suite Beta',
            'status' => 'archived',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->tester)->getJson("/api/v1/projects/{$this->project->id}/test-suites?status=active");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.name', 'Suite Alpha');
    }

    public function test_can_soft_delete_and_restore_test_suite(): void
    {
        $suite = TestSuite::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'name' => 'Suite to Delete',
            'created_by' => $this->admin->id,
        ]);

        $deleteRes = $this->actingAs($this->admin)->deleteJson("/api/v1/test-suites/{$suite->id}");
        $deleteRes->assertStatus(200);

        $this->assertSoftDeleted('test_suites', ['id' => $suite->id]);

        $restoreRes = $this->actingAs($this->admin)->postJson("/api/v1/test-suites/{$suite->id}/restore");
        $restoreRes->assertStatus(200);

        $this->assertDatabaseHas('test_suites', ['id' => $suite->id, 'deleted_at' => null]);
    }
}
