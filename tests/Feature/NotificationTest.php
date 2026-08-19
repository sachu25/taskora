<?php

namespace Tests\Feature;

use App\Domain\Notification\Actions\CreateNotification;
use App\Domain\Notification\NotificationType;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
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

    public function test_user_can_list_own_notifications(): void
    {
        Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Test Notification',
            'message' => 'This is a test notification message.',
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_user_can_fetch_unread_count(): void
    {
        Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Unread 1',
            'message' => 'Unread msg 1',
        ]);

        Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Read 1',
            'message' => 'Read msg 1',
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_user_can_mark_notification_as_read_and_unread(): void
    {
        $notification = Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Test',
            'message' => 'Message',
        ]);

        $id = $notification->id;

        $readRes = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->postJson('/api/v1/notifications/' . $id . '/read');

        $readRes->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $unreadRes = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->postJson('/api/v1/notifications/' . $id . '/unread');

        $unreadRes->assertStatus(200)
            ->assertJsonPath('data.is_read', false);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Test 1',
            'message' => 'Message 1',
        ]);

        Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::SPRINT_STARTED,
            'title' => 'Test 2',
            'message' => 'Message 2',
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->postJson('/api/v1/notifications/read-all');

        $response->assertStatus(200)
            ->assertJsonPath('data.updated_count', 2);

        $this->assertEquals(0, Notification::where('user_id', $this->user->id)->whereNull('read_at')->count());
    }

    public function test_user_can_delete_notification(): void
    {
        $notification = Notification::create([
            'organization_id' => $this->org->id,
            'user_id' => $this->user->id,
            'type' => NotificationType::ISSUE_ASSIGNED,
            'title' => 'Delete Me',
            'message' => 'Message',
        ]);

        $id = $notification->id;

        $response = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->deleteJson('/api/v1/notifications/' . $id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('notifications', ['id' => $id]);
    }

    public function test_user_can_manage_notification_preferences(): void
    {
        $updateRes = $this->actingAs($this->user)
            ->withHeader('X-Organization-Id', $this->org->id)
            ->patchJson('/api/v1/notification-preferences/issue_assigned', [
                'enabled' => false,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.enabled', false);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $this->user->id,
            'preference_key' => 'issue_assigned',
            'enabled' => false,
        ]);

        // Attempting to create notification when category disabled should return null
        $action = new CreateNotification();
        $notif = $action->execute(
            organizationId: $this->org->id,
            userId: $this->user->id,
            type: NotificationType::ISSUE_ASSIGNED,
            title: 'Disabled Test',
            message: 'Should not create'
        );

        $this->assertNull($notif);
    }
}
