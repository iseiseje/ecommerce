<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id'),
                TextInput::make('amount')
                    ->required()
                    ->numeric(),
                Textarea::make('status')
                    ->required()
                    ->default('pending')
                    ->columnSpanFull(),
                Textarea::make('checkout_url')
                    ->columnSpanFull(),
                TextInput::make('tracking_number'),
                TextInput::make('shipping_address_id')
                    ->numeric(),
            ]);
    }
}
