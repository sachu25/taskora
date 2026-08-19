<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_run_cases', function (Blueprint $table) {
            $table->string('id', 26)->primary();
            $table->string('test_run_id', 26);
            $table->string('test_case_id', 26);
            $table->unsignedInteger('position')->default(1);
            $table->string('created_by', 26);
            $table->timestamps();

            $table->foreign('test_run_id')->references('id')->on('test_runs')->onDelete('cascade');
            $table->foreign('test_case_id')->references('id')->on('test_cases')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['test_run_id', 'test_case_id']);

            $table->index('test_run_id');
            $table->index('test_case_id');
            $table->index(['test_run_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_run_cases');
    }
};
