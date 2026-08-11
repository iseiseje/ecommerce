<?php

namespace App\Filament\Resources\Promos\Schemas;

use Filament\Schemas\Schema;

class PromoForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('discount_code')
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('discount_percent')
                    ->numeric(),
                \Filament\Schemas\Components\TextInput::make('image_url')
                    ->label('Image URL')
                    ->maxLength(255),
                \Filament\Schemas\Components\DateTimePicker::make('valid_until'),
                \Filament\Schemas\Components\Textarea::make('description')
                    ->columnSpanFull(),
            ]);
    }
}
