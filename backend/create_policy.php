<?php
use Illuminate\Support\Facades\DB;

try {
    DB::statement('CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);');
    echo "Category policy created successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
