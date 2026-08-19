<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignUlid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->unsignedBigInteger('issue_number');

            $table->string('issue_type')->default('task'); // bug, task, story, feature, improvement
            $table->string('title');
            $table->longText('description')->nullable();

            $table->string('status')->default('todo'); // backlog, todo, in_progress, done
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('severity')->nullable(); // minor, major, critical, blocker

            $table->foreignUlid('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('parent_id')->nullable()->constrained('issues')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'issue_number']);
            $table->index('organization_id');
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'priority']);
            $table->index(['project_id', 'assignee_id']);
            $table->index(['project_id', 'reporter_id']);
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
