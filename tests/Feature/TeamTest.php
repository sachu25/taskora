<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_team(): void
    {
        $org = Organization::factory()->create();
        $admin = User::factory()->create();
        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $admin->id,
            'role' => 'organization_admin',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/organizations/{$org->id}/teams", [
                'name' => 'Backend Engineers',
                'description' => 'API and Database team',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Backend Engineers');
    }

    public function test_prevents_duplicate_team_membership(): void
    {
        $org = Organization::factory()->create();
        $admin = User::factory()->create();
        $dev = User::factory()->create();

        OrganizationMember::create(['organization_id' => $org->id, 'user_id' => $admin->id, 'role' => 'organization_admin']);
        OrganizationMember::create(['organization_id' => $org->id, 'user_id' => $dev->id, 'role' => 'developer']);

        $team = Team::create(['organization_id' => $org->id, 'name' => 'DevOps', 'slug' => 'devops', 'created_by' => $admin->id]);
        TeamMember::create(['team_id' => $team->id, 'user_id' => $dev->id]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/teams/{$team->id}/members", [
                'user_id' => $dev->id,
            ]);

        $response->assertStatus(422);
    }
}
