<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueWatcherTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;
    private Project $project;
    private Issue $issue;

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
        $this->issue = Issue::create([
            'organization_id' => $this->org->id,
            'project_id' => $this->project->id,
            'issue_number' => 1,
            'title' => 'Issue for watchers',
            'reporter_id' => $this->user->id,
        ]);
    }

    public function test_user_can_watch_and_unwatch_issue(): void
    {
        $watchResponse = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issue->id}/watchers");

        $watchResponse->assertStatus(200);
        $this->assertDatabaseHas('issue_watchers', [
            'issue_id' => $this->issue->id,
            'user_id' => $this->user->id,
        ]);

        $unwatchResponse = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/v1/issues/{$this->issue->id}/watchers/{$this->user->id}");

        $unwatchResponse->assertStatus(200);
        $this->assertDatabaseMissing('issue_watchers', [
            'issue_id' => $this->issue->id,
            'user_id' => $this->user->id,
        ]);
    }
}
