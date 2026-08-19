<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\IssueComment;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueCommentTest extends TestCase
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
            'title' => 'Issue for comments',
            'reporter_id' => $this->user->id,
        ]);
    }

    public function test_user_can_add_comment(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issue->id}/comments", [
                'body' => 'This is a test comment.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.body', 'This is a test comment.')
            ->assertJsonPath('data.user.email', $this->user->email);

        $this->assertDatabaseHas('issue_comments', [
            'issue_id' => $this->issue->id,
            'body' => 'This is a test comment.',
        ]);
    }

    public function test_user_can_update_own_comment(): void
    {
        $comment = IssueComment::create([
            'organization_id' => $this->org->id,
            'issue_id' => $this->issue->id,
            'user_id' => $this->user->id,
            'body' => 'Original text',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/v1/comments/{$comment->id}", [
                'body' => 'Updated text',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.body', 'Updated text');
    }

    public function test_user_can_soft_delete_comment(): void
    {
        $comment = IssueComment::create([
            'organization_id' => $this->org->id,
            'issue_id' => $this->issue->id,
            'user_id' => $this->user->id,
            'body' => 'Text to delete',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('issue_comments', ['id' => $comment->id]);
    }
}
