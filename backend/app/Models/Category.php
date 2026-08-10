<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

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
     * Sinkronisasi perubahan kategori dari Laravel VPS ke Supabase REST API jika DB terpisah
     */
    protected static function syncToSupabase($model)
    {
        $supabaseUrl = env('SUPABASE_URL', 'https://axkgduqdqwnyvhzpkrnj.supabase.co');
        $supabaseServiceKey = env('SUPABASE_SERVICE_ROLE_KEY') ?: env('SUPABASE_ANON_KEY', 'sb_publishable_fc5hf1S68TiQPg4tMbh3-A_vF6oCUkN');

        if (empty($supabaseUrl)) return;

        try {
            Http::withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => 'Bearer ' . $supabaseServiceKey,
                'Content-Type' => 'application/json',
                'Prefer' => 'resolution=merge-duplicates',
            ])->post("{$supabaseUrl}/rest/v1/categories", [
                'id' => $model->id,
                'name' => $model->name,
                'slug' => $model->slug,
                'icon' => $model->icon ?: '🏷️',
            ]);
        } catch (\Throwable $e) {
            // Ignore if same DB is used
        }
    }

    /**
     * Hapus kategori di Supabase saat dihapus dari Laravel VPS
     */
    protected static function deleteFromSupabase($model)
    {
        $supabaseUrl = env('SUPABASE_URL', 'https://axkgduqdqwnyvhzpkrnj.supabase.co');
        $supabaseServiceKey = env('SUPABASE_SERVICE_ROLE_KEY') ?: env('SUPABASE_ANON_KEY', 'sb_publishable_fc5hf1S68TiQPg4tMbh3-A_vF6oCUkN');

        if (empty($supabaseUrl)) return;

        try {
            Http::withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => 'Bearer ' . $supabaseServiceKey,
            ])->delete("{$supabaseUrl}/rest/v1/categories?id=eq.{$model->id}");
        } catch (\Throwable $e) {
            // Ignore if same DB is used
        }
    }
}
