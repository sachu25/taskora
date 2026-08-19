<?php

namespace App\Http\Requests\Sprint;

use Illuminate\Foundation\Http\FormRequest;

class ReorderSprintIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position' => ['required', 'integer', 'min:0'],
        ];
    }
}
