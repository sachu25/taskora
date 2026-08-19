<?php

namespace App\Http\Requests\Release;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReleaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'version' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'release_date' => ['nullable', 'date'],
            'release_manager_id' => ['nullable', 'string', 'exists:users,id'],
        ];
    }
}
