<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('products', function (Blueprint $table) {
    if (!Schema::hasColumn('products', 'category_id')) {
        $table->uuid('category_id')->nullable();
    }
});
