<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Notification\Actions\DeleteAllReadNotifications;
use App\Domain\Notification\Actions\DeleteNotification;
use App\Domain\Notification\Actions\MarkAllNotificationsAsRead;
use App\Domain\Notification\Actions\MarkNotificationAsRead;
use App\Domain\Notification\Actions\MarkNotificationAsUnread;
use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $query = Notification::where('organization_id', $orgId)
            ->where('user_id', $user->id);

        if ($request->has('read')) {
            $isRead = filter_var($request->query('read'), FILTER_VALIDATE_BOOLEAN);
            if ($isRead) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->query('project_id'));
        }

        $perPage = min((int) $request->query('per_page', 15), 50);
        $notifications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved successfully',
            'data' => [
                'items' => NotificationResource::collection($notifications->items()),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'last_page' => $notifications->lastPage(),
                ],
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $count = Notification::where('organization_id', $orgId)
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Unread notification count retrieved',
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    public function show(Notification $notification): JsonResponse
    {
        $this->authorize('view', $notification);

        return response()->json([
            'success' => true,
            'message' => 'Notification retrieved',
            'data' => new NotificationResource($notification),
        ]);
    }

    public function markAsRead(Notification $notification, MarkNotificationAsRead $action): JsonResponse
    {
        $this->authorize('update', $notification);

        $updated = $action->execute($notification);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => new NotificationResource($updated),
        ]);
    }

    public function markAsUnread(Notification $notification, MarkNotificationAsUnread $action): JsonResponse
    {
        $this->authorize('update', $notification);

        $updated = $action->execute($notification);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as unread',
            'data' => new NotificationResource($updated),
        ]);
    }

    public function markAllAsRead(Request $request, MarkAllNotificationsAsRead $action): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $count = $action->execute($orgId, $user->id);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
            'data' => [
                'updated_count' => $count,
            ],
        ]);
    }

    public function destroy(Notification $notification, DeleteNotification $action): JsonResponse
    {
        $this->authorize('delete', $notification);

        $action->execute($notification);

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
            'data' => null,
        ]);
    }

    public function destroyRead(Request $request, DeleteAllReadNotifications $action): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $count = $action->execute($orgId, $user->id);

        return response()->json([
            'success' => true,
            'message' => "{$count} read notifications deleted",
            'data' => [
                'deleted_count' => $count,
            ],
        ]);
    }
}
