<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Organization;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $user = $request->user();
        $userRole = $user->getOrganizationRole($organization->id);

        $projectsCount = $organization->projects()->count();
        $teamsCount = $organization->teams()->count();
        $membersCount = $organization->members()->count();

        $recentProjects = $organization->projects()
            ->withCount('members')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return $this->successResponse([
            'organization_name' => $organization->name,
            'user_role' => $userRole,
            'stats' => [
                'projects_count' => $projectsCount,
                'teams_count' => $teamsCount,
                'members_count' => $membersCount,
            ],
            'recent_projects' => ProjectResource::collection($recentProjects),
        ], 'Dashboard foundation data retrieved');
    }
}
