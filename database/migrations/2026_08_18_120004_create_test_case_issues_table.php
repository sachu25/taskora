<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_case_issues', function (Blueprint $table) {
            $table->string('test_case_id', 26);
            $table->string('issue_id', 26);
            $table->string('created_by', 26);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('test_case_id')->references('id')->on('test_cases')->onDelete('cascade');
            $table->foreign('issue_id')->references('id')->on('issues')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            $table->primary(['test_case_id', 'issue_id']);
            $table->index('test_case_id');
            $table->index('issue_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_case_issues');
    }
};
