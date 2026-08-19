<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_organization(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/organizations', [
                'name' => 'Stark Industries',
                'description' => 'Advanced tech R&D',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Stark Industries');

        $orgId = $response->json('data.id');

        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $orgId,
            'user_id' => $user->id,
            'role' => 'organization_admin',
        ]);
    }

    public function test_member_can_view_organization(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create();
        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $user->id,
            'role' => 'developer',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/organizations/{$org->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $org->id);
    }
}
