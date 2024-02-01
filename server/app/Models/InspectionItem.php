<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'job_id',
        'library_item_id',
        'images',
        'note',
        'height',
        'custom',
        'previousItem',
        'openingParagraph',
        'closingParagraph',
        'embeddedImage'
    ];

    protected $casts = [
        'images' => 'array',
        'custom' => 'boolean',
        'previousItem' => 'boolean'
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    /**
     * Get the report that owns the InspectionItem
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class, 'report_id');
    }
}
