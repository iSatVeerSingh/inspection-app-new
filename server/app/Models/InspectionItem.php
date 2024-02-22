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
        'id',
        'name',
        'job_id',
        'library_item_id',
        'images',
        'note',
        'height',
        'custom',
        'previousItem',
        'previous_item_id',
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
     * Get the libraryItem that owns the InspectionItem
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function libraryItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'library_item_id');
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

    /**
     * Get the prevReportItem that owns the InspectionItem
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function prevReportItem(): BelongsTo
    {
        return $this->belongsTo(InspectionItem::class, 'previous_item_id');
    }
}
