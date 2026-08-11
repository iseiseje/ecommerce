<?php
use Illuminate\Support\Facades\DB;

try {
    DB::statement('CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);');
    echo "Product policy created successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
