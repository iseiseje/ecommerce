<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Category extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'icon',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });

        // Event listener saat Kategori disimpan/diperbarui dari Laravel Filament Admin VPS
        static::saved(function ($model) {
            static::syncToSupabase($model);
        });

        // Event listener saat Kategori dihapus dari Laravel Filament Admin VPS
        static::deleted(function ($model) {
            static::deleteFromSupabase($model);
        });
    }

    /**
     * Sinkronisasi perubahan kategori dari Laravel VPS ke Supabase REST API
     */
    protected static function syncToSupabase($model)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseServiceKey = env('SUPABASE_SERVICE_ROLE_KEY') ?: env('SUPABASE_ANON_KEY');

        if (empty($supabaseUrl) || empty($supabaseServiceKey)) return;

        try {
            // 1. Coba perbarui data di Supabase berdasarkan slug
            $res = Http::withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => 'Bearer ' . $supabaseServiceKey,
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->patch("{$supabaseUrl}/rest/v1/categories?slug=eq.{$model->slug}", [
                'name' => $model->name,
                'icon' => $model->icon ?: '🏷️',
            ]);

            // 2. Jika slug belum ada di Supabase, buat data baru (INSERT)
            if ($res->successful() && (empty($res->json()) || count($res->json()) === 0)) {
                Http::withHeaders([
                    'apikey' => $supabaseServiceKey,
                    'Authorization' => 'Bearer ' . $supabaseServiceKey,
                    'Content-Type' => 'application/json',
                ])->post("{$supabaseUrl}/rest/v1/categories", [
                    'name' => $model->name,
                    'slug' => $model->slug,
                    'icon' => $model->icon ?: '🏷️',
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Supabase sync error: ' . $e->getMessage());
        }
    }

    /**
     * Hapus kategori di Supabase saat dihapus dari Laravel VPS
     */
    protected static function deleteFromSupabase($model)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseServiceKey = env('SUPABASE_SERVICE_ROLE_KEY') ?: env('SUPABASE_ANON_KEY');

        if (empty($supabaseUrl) || empty($supabaseServiceKey)) return;

        try {
            Http::withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => 'Bearer ' . $supabaseServiceKey,
            ])->delete("{$supabaseUrl}/rest/v1/categories?slug=eq.{$model->slug}");
        } catch (\Throwable $e) {
            Log::error('Supabase delete sync error: ' . $e->getMessage());
        }
    }
}
