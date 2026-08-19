<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Team\Actions\AddTeamMember;
use App\Domain\Team\Actions\RemoveTeamMember;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Models\Team;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        $members = $team->members()->with('user')->get();

        return $this->successResponse(
            TeamMemberResource::collection($members),
            'Team members retrieved successfully'
        );
    }

    public function store(Request $request, Team $team, AddTeamMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $team);

        $validated = $request->validate([
            'user_id' => ['required', 'string', 'exists:users,id'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);
        $member = $action->execute($request->user(), $team, $targetUser);
        $member->load('user');

        return $this->successResponse(
            new TeamMemberResource($member),
            'User added to team successfully',
            201
        );
    }

    public function destroy(Team $team, User $user, RemoveTeamMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $team);

        $action->execute(auth()->user(), $team, $user);

        return $this->successResponse(null, 'User removed from team successfully');
    }
}
