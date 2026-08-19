<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueLinkTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;
    private Project $project;
    private Issue $issue1;
    private Issue $issue2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->org = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        OrganizationMember::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'role' => 'developer',
            'status' => 'active',
            'joined_at' => now(),
        ]);
        $this->project = Project::create([
            'organization_id' => $this->org->id,
            'name' => 'Project',
            'key' => 'PRJ',
            'slug' => 'project',
            'status' => 'active',
            'visibility' => 'organization',
            'created_by' => $this->user->id,
        ]);
        $this->issue1 = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Issue 1',
            'reporter_id' => $this->user->id,
        ]);
        $this->issue2 = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 2,
            'title' => 'Issue 2',
            'reporter_id' => $this->user->id,
        ]);
    }

    public function test_can_link_two_issues(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issue1->id}/links", [
                'linked_issue_id' => $this->issue2->id,
                'link_type' => 'blocks',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.link_type', 'blocks')
            ->assertJsonPath('data.linked_issue.key', 'PRJ-2');

        $this->assertDatabaseHas('issue_links', [
            'issue_id' => $this->issue1->id,
            'linked_issue_id' => $this->issue2->id,
            'link_type' => 'blocks',
        ]);
    }

    public function test_cannot_link_issue_to_itself(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issue1->id}/links", [
                'linked_issue_id' => $this->issue1->id,
                'link_type' => 'relates_to',
            ]);

        $response->assertStatus(422);
    }
}
