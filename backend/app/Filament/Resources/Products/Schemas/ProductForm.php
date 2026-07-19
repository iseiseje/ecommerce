<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('price')
                    ->required()
                    ->numeric(),
                \Filament\Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
                \Filament\Forms\Components\TextInput::make('image_url')
                    ->label('Image URL')
                    ->url()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('genlook_external_id')
                    ->label('Genlook Product ID')
                    ->maxLength(255),
            ]);
    }
}
