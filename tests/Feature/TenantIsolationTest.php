<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_from_org_a_cannot_access_org_b_details(): void
    {
        $orgA = Organization::factory()->create(['name' => 'Org A']);
        $userA = User::factory()->create();
        OrganizationMember::create(['organization_id' => $orgA->id, 'user_id' => $userA->id, 'role' => 'organization_admin']);

        $orgB = Organization::factory()->create(['name' => 'Org B']);

        // User A attempts to view Org B details
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/organizations/{$orgB->id}");

        $response->assertStatus(403);
    }

    public function test_user_from_org_a_cannot_access_org_b_projects(): void
    {
        $orgA = Organization::factory()->create(['name' => 'Org A']);
        $userA = User::factory()->create();
        OrganizationMember::create(['organization_id' => $orgA->id, 'user_id' => $userA->id, 'role' => 'organization_admin']);

        $orgB = Organization::factory()->create(['name' => 'Org B']);
        $projectB = Project::create([
            'organization_id' => $orgB->id,
            'name' => 'Secret Project B',
            'key' => 'SEC',
            'slug' => 'secret-project-b',
        ]);

        // User A attempts to view Org B project list
        $response1 = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/organizations/{$orgB->id}/projects");
        $response1->assertStatus(403);

        // User A attempts to view specific Project B
        $response2 = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/projects/{$projectB->id}");
        $response2->assertStatus(403);
    }

    public function test_user_from_org_a_cannot_access_org_b_teams(): void
    {
        $orgA = Organization::factory()->create(['name' => 'Org A']);
        $userA = User::factory()->create();
        OrganizationMember::create(['organization_id' => $orgA->id, 'user_id' => $userA->id, 'role' => 'organization_admin']);

        $orgB = Organization::factory()->create(['name' => 'Org B']);
        $teamB = Team::create([
            'organization_id' => $orgB->id,
            'name' => 'Secret Team B',
            'slug' => 'secret-team-b',
        ]);

        // User A attempts to view Org B teams
        $response1 = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/organizations/{$orgB->id}/teams");
        $response1->assertStatus(403);

        // User A attempts to view specific Team B
        $response2 = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/teams/{$teamB->id}");
        $response2->assertStatus(403);
    }

    public function test_user_from_org_a_cannot_access_org_b_dashboard(): void
    {
        $orgA = Organization::factory()->create(['name' => 'Org A']);
        $userA = User::factory()->create();
        OrganizationMember::create(['organization_id' => $orgA->id, 'user_id' => $userA->id, 'role' => 'organization_admin']);

        $orgB = Organization::factory()->create(['name' => 'Org B']);

        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/organizations/{$orgB->id}/dashboard");

        $response->assertStatus(403);
    }
}
