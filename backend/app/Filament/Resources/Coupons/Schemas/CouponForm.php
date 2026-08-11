<?php

namespace App\Filament\Resources\Coupons\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CouponForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('code')
                    ->required(),
                TextInput::make('discount_type')
                    ->required()
                    ->default('percent'),
                TextInput::make('discount_value')
                    ->required()
                    ->numeric(),
                TextInput::make('min_purchase')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('max_discount')
                    ->numeric(),
                DateTimePicker::make('valid_from'),
                DateTimePicker::make('valid_until'),
                TextInput::make('usage_limit')
                    ->numeric(),
                TextInput::make('used_count')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
