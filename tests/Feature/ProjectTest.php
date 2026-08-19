<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_project(): void
    {
        $org = Organization::factory()->create();
        $admin = User::factory()->create();
        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $admin->id,
            'role' => 'organization_admin',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/organizations/{$org->id}/projects", [
                'name' => 'Mobile App Revamp',
                'key' => 'MOB',
                'description' => 'New iOS & Android application',
                'status' => 'active',
                'visibility' => 'organization',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Mobile App Revamp')
            ->assertJsonPath('data.key', 'MOB');
    }

    public function test_project_key_must_be_unique_within_organization(): void
    {
        $org = Organization::factory()->create();
        $admin = User::factory()->create();
        OrganizationMember::create(['organization_id' => $org->id, 'user_id' => $admin->id, 'role' => 'organization_admin']);

        Project::create([
            'organization_id' => $org->id,
            'name' => 'Existing Project',
            'key' => 'PROJ',
            'slug' => 'existing-project',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/organizations/{$org->id}/projects", [
                'name' => 'New Project',
                'key' => 'PROJ',
            ]);

        $response->assertStatus(422);
    }
}
