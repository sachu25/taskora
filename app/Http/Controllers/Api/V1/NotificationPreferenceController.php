<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Notification\Actions\ResetNotificationPreferences;
use App\Domain\Notification\Actions\UpdateNotificationPreference;
use App\Domain\Notification\NotificationType;
use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationPreferenceResource;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationPreferenceController extends Controller
{
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

        $preferences = NotificationPreference::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences retrieved',
            'data' => NotificationPreferenceResource::collection($preferences),
        ]);
    }

    public function update(Request $request, string $preferenceKey, UpdateNotificationPreference $action): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $pref = $action->execute(
            organizationId: $orgId,
            userId: $user->id,
            preferenceKey: $preferenceKey,
            enabled: $validated['enabled']
        );

        return response()->json([
            'success' => true,
            'message' => 'Notification preference updated',
            'data' => new NotificationPreferenceResource($pref),
        ]);
    }

    public function reset(Request $request, ResetNotificationPreferences $action): JsonResponse
    {
        $user = Auth::user();

        $action->execute($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences reset to defaults',
            'data' => null,
        ]);
    }
}
