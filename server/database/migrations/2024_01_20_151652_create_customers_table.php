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
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('active')->default(true)->index();
            $table->string('nameOnReport')->nullable();
            $table->string('name')->default('');
            $table->string('email')->default('');
            $table->string('phone')->default('');
            $table->string('billingAddress')->nullable();
            $table->string('builder')->nullable();
            $table->string('builderEmail')->nullable();
            $table->string('builderPhone')->nullable();
            $table->string('supervisor')->nullable();
            $table->string('supervisorEmail')->nullable();
            $table->string('supervisorPhone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
