<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false; // Supabase uses created_at, but we'll disable standard Eloquent timestamps to avoid issues, or we can just map them.

    protected $fillable = [
        'name',
        'description',
        'price',
        'image_url',
        'genlook_external_id'
    ];
}
