<?php

namespace App\Http\Requests\Release;

use Illuminate\Foundation\Http\FormRequest;

class AddReleaseIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'issue_id' => ['required', 'string', 'exists:issues,id'],
        ];
    }
}
