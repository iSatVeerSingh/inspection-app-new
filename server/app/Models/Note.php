<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    use HasFactory, HasUuids;


    protected $fillable = [
        'category_id',
        'text',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    /**
     * Get the jobCategory that owns the Note
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jobCategory(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'category_id');
    }
}
