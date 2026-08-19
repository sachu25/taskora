<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\TestCase as TestCaseModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestCaseIssueTest extends TestCase
{
    use RefreshDatabase;

    private User $tester;
    private Organization $org;
    private Project $projectA;
    private Project $projectB;
    private TestCaseModel $testCase;
    private Issue $issueA;
    private Issue $issueB;

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

        $this->testCase = TestCaseModel::create(['organization_id' => $this->org->id, 'project_id' => $this->projectA->id, 'case_number' => 1, 'title' => 'Test Case A', 'created_by' => $this->tester->id]);

        $this->issueA = Issue::create(['organization_id' => $this->org->id, 'project_id' => $this->projectA->id, 'issue_number' => 1, 'title' => 'Issue A', 'reporter_id' => $this->tester->id]);
        $this->issueB = Issue::create(['organization_id' => $this->org->id, 'project_id' => $this->projectB->id, 'issue_number' => 1, 'title' => 'Issue B', 'reporter_id' => $this->tester->id]);
    }

    public function test_can_link_and_unlink_issue_to_test_case_in_same_project(): void
    {
        $linkRes = $this->actingAs($this->tester)->postJson("/api/v1/test-cases/{$this->testCase->id}/issues", [
            'issue_id' => $this->issueA->id,
        ]);

        $linkRes->assertStatus(201);

        $this->assertDatabaseHas('test_case_issues', [
            'test_case_id' => $this->testCase->id,
            'issue_id' => $this->issueA->id,
        ]);

        $unlinkRes = $this->actingAs($this->tester)->deleteJson("/api/v1/test-cases/{$this->testCase->id}/issues/{$this->issueA->id}");
        $unlinkRes->assertStatus(200);

        $this->assertDatabaseMissing('test_case_issues', [
            'test_case_id' => $this->testCase->id,
            'issue_id' => $this->issueA->id,
        ]);
    }

    public function test_cannot_link_test_case_to_issue_from_different_project(): void
    {
        $res = $this->actingAs($this->tester)->postJson("/api/v1/test-cases/{$this->testCase->id}/issues", [
            'issue_id' => $this->issueB->id,
        ]);

        $res->assertStatus(422);
    }
}
