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
            $table->foreignUuid('category_id')->constrained('item_categories');
            $table->string('name')->index();
            $table->text('summary')->nullable();
            $table->text('openingParagraph');
            $table->text('closingParagraph');
            $table->json('embeddedImages')->nullable();
            $table->enum('embeddedImagePlace', ['Before Item Images', 'Before Closing Paragraph', 'After Closing Paragraph'])->default('Before Closing Paragraph');
            $table->integer('height', false, true)->default(0);
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
