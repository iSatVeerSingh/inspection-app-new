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
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('active')->default(true)->index();
            $table->foreignUuid('category_id')->constrained('item_categories');
            $table->string('name')->index();
            $table->string('summary')->nullable();
            $table->text('openingParagraph');
            $table->text('closingParagraph');
            $table->longText('embeddedImage')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
