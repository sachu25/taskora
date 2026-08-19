<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('release_issues', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('release_id')->constrained('releases')->onDelete('cascade');
            $table->foreignUlid('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignUlid('added_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['release_id', 'issue_id']);
            $table->index('release_id');
            $table->index('issue_id');
            $table->index('added_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('release_issues');
    }
};
