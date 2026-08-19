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
        Schema::create('sprint_issues', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sprint_id')->constrained('sprints')->onDelete('cascade');
            $table->foreignUlid('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignUlid('added_by')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('added_at');
            $table->timestamps();

            $table->unique(['sprint_id', 'issue_id']);
            $table->index('sprint_id');
            $table->index('issue_id');
            $table->index(['sprint_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sprint_issues');
    }
};
