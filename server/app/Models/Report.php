<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'job_id',
        'customer_id',
        'inspectionNotes',
        'completedAt',
        'pdf'
    ];

    protected $casts = [
        'inspectionNotes' => 'array',
        'completedAt' => 'datetime',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }
}
