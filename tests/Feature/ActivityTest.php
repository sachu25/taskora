<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $org;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->org = Organization::factory()->create();

        OrganizationMember::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'role' => 'developer',
            'joined_at' => now(),
        ]);

        $this->project = Project::factory()->create([
            'organization_id' => $this->org->id,
            'created_by' => $this->user->id,
        ]);
    }

    public function test_user_can_list_organization_activity(): void
    {
        ActivityLog::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'action' => 'project.created',
            'description' => "Created project '{$this->project->name}'",
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->getJson('/api/v1/activity');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_user_can_list_project_activity(): void
    {
        ActivityLog::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'action' => 'project.updated',
            'subject_type' => Project::class,
            'subject_id' => $this->project->id,
            'description' => "Updated project '{$this->project->name}'",
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/projects/{$this->project->id}/activity");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items');
    }
}
