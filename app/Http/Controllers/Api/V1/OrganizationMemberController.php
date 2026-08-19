<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Organization\Actions\AddOrganizationMember;
use App\Domain\Organization\Actions\RemoveOrganizationMember;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationMemberResource;
use App\Models\Organization;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationMemberController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $members = $organization->members()->with('user')->get();

        return $this->successResponse(
            OrganizationMemberResource::collection($members),
            'Organization members retrieved successfully'
        );
    }

    public function store(Request $request, Organization $organization, AddOrganizationMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $organization);

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'string', 'in:organization_admin,project_manager,developer,tester,reporter'],
        ]);

        $member = $action->execute($request->user(), $organization, $validated['email'], $validated['role']);
        $member->load('user');

        return $this->successResponse(
            new OrganizationMemberResource($member),
            'Member added to organization successfully',
            201
        );
    }

    public function destroy(Organization $organization, User $user, RemoveOrganizationMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $organization);

        $action->execute(auth()->user(), $organization, $user);

        return $this->successResponse(null, 'Member removed from organization successfully');
    }
}
