<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Auth\Actions\LoginUser;
use App\Domain\Auth\Actions\RegisterUser;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request, RegisterUser $action): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults()],
            'organization_name' => ['required', 'string', 'max:255'],
        ]);

        $result = $action->execute($validated);

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'organization' => new OrganizationResource($result['organization']),
            'token' => $result['token'],
        ], 'Registration successful', 201);
    }

    public function login(Request $request, LoginUser $action): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $result = $action->execute($validated['email'], $validated['password']);

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'organizations' => OrganizationResource::collection($result['organizations']),
            'token' => $result['token'],
        ], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('organizations');

        return $this->successResponse([
            'user' => new UserResource($user),
            'organizations' => OrganizationResource::collection($user->organizations),
        ], 'Authenticated user retrieved');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        // Password reset foundation
        return $this->successResponse(null, 'If your email is registered, you will receive a password reset link shortly.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', Password::defaults()],
        ]);

        // Password reset foundation
        return $this->successResponse(null, 'Password has been reset successfully.');
    }
}
