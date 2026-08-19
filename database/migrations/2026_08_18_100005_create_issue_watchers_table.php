<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_watchers', function (Blueprint $table) {
            $table->foreignUlid('issue_id')->constrained('issues')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['issue_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_watchers');
    }
};
