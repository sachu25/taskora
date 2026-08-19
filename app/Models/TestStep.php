<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestStep extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'test_case_id',
        'step_number',
        'action',
        'expected_result',
    ];

    public function testCase(): BelongsTo
    {
        return $this->belongsTo(TestCase::class, 'test_case_id');
    }
}
