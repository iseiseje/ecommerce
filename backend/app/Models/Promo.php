<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Promo extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'discount_code',
        'discount_percent',
        'image_url',
        'valid_until',
    ];

    protected $casts = [
        'valid_until' => 'datetime',
    ];
}
