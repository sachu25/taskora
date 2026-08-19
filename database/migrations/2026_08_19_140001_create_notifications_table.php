<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUlid('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();
            $table->string('action_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('organization_id');
            $table->index('user_id');
            $table->index('project_id');
            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
            $table->index('type');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
