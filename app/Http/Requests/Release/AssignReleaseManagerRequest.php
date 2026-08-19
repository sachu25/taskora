<?php

namespace App\Http\Requests\Release;

use Illuminate\Foundation\Http\FormRequest;

class AssignReleaseManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'string', 'exists:users,id'],
        ];
    }
}
