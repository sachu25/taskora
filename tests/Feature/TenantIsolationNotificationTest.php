<?php

namespace Tests\Feature;

use App\Domain\Notification\NotificationType;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;
    protected Organization $orgA;

    protected User $userB;
    protected Organization $orgB;

    protected Notification $notificationA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userA = User::factory()->create();
        $this->orgA = Organization::factory()->create();
        OrganizationMember::create([
            'organization_id' => $this->orgA->id,
            'user_id' => $this->userA->id,
            'role' => 'developer',
            'joined_at' => now(),
        ]);

        $this->userB = User::factory()->create();
        $this->orgB = Organization::factory()->create();
        OrganizationMember::create([
            'organization_id' => $this->orgB->id,
            'user_id' => $this->userB->id,
            'role' => 'developer',
            'joined_at' => now(),
        ]);

        $this->notificationA = Notification::create([
            'organization_id' => $this->orgA->id,
            'user_id' => $this->userA->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Org A Notification',
            'message' => 'Message for Org A',
        ]);
    }

    public function test_user_b_cannot_view_user_a_notifications(): void
    {
        $id = $this->notificationA->id;
        $response = $this->actingAs($this->userB)
            ->withHeader('X-Organization-Id', $this->orgB->id)
            ->getJson('/api/v1/notifications/' . $id);

        $response->assertStatus(403);
    }

    public function test_user_b_cannot_mark_user_a_notification_as_read(): void
    {
        $id = $this->notificationA->id;
        $response = $this->actingAs($this->userB)
            ->withHeader('X-Organization-Id', $this->orgB->id)
            ->postJson('/api/v1/notifications/' . $id . '/read');

        $response->assertStatus(403);
    }

    public function test_user_b_cannot_delete_user_a_notification(): void
    {
        $id = $this->notificationA->id;
        $response = $this->actingAs($this->userB)
            ->withHeader('X-Organization-Id', $this->orgB->id)
            ->deleteJson('/api/v1/notifications/' . $id);

        $response->assertStatus(403);
    }
}
