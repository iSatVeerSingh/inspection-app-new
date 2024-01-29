<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'type',
        'stageOfWorks',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    /**
     * Get all of the notes for the JobCategory
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'category_id');
    }

    /**
     * Get all of the jobs for the JobCategory
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'category_id');
    }
}
