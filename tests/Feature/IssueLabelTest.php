<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Label;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueLabelTest extends TestCase
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
            'role' => 'organization_admin',
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
            'title' => 'Issue for labels',
            'reporter_id' => $this->user->id,
        ]);
    }

    public function test_can_create_organization_label(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/organizations/{$this->org->id}/labels", [
                'name' => 'frontend',
                'color' => '#3b82f6',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'frontend')
            ->assertJsonPath('data.color', '#3b82f6');
    }

    public function test_can_attach_and_detach_label_to_issue(): void
    {
        $label = Label::create([
            'organization_id' => $this->org->id,
            'name' => 'backend',
            'color' => '#10b981',
        ]);

        $attachResponse = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/issues/{$this->issue->id}/labels/{$label->id}");

        $attachResponse->assertStatus(200);
        $this->assertDatabaseHas('issue_labels', [
            'issue_id' => $this->issue->id,
            'label_id' => $label->id,
        ]);

        $detachResponse = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/v1/issues/{$this->issue->id}/labels/{$label->id}");

        $detachResponse->assertStatus(200);
        $this->assertDatabaseMissing('issue_labels', [
            'issue_id' => $this->issue->id,
            'label_id' => $label->id,
        ]);
    }
}
