<?php

namespace App\Http\Requests\Sprint;

use Illuminate\Foundation\Http\FormRequest;

class AddSprintIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'issue_id' => ['required', 'string', 'exists:issues,id'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
